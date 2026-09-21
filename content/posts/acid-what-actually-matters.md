---
title: "ACID: What Actually Matters"
date: 2026-09-21T22:30:00+05:30
draft: false
description: "Pop-science knowledge of ACID wasn't really cutting it. So, I went back, read and hese are my consolidated notes on what actually matters: anomalies, isolation levels, and how Postgres handles each one."
tags: ["databases", "postgres", "transactions", "fundamentals"]
ShowToc: true
TocOpen: true
cover:
  image: ""
  alt: ""
  caption: ""
---

ACID stands for **A**tomicity, **C**onsistency, **I**solation, **D**urability.

I found that "ACID compliant" is fuzzy in practice. Implementations differ a lot, especially on isolation, so the label alone tells you little.

> **Prerequisites:** Basic familiarity with SQL (`SELECT`, `UPDATE`, `INSERT`, `BEGIN`/`COMMIT`) so you can follow the examples and a general idea of what a database transaction is. All examples use PostgreSQL.

# Transaction

A way for an application to group several reads and writes together into a logical unit.

# Atomicity

This means that any transaction in the database either completely commits or rolls back completely on failure.

*Note: It does not point to concurrency (like in multithreading), rather is about abortability.*

```sql
-- id=1 balance 100, id=2 balance 50
BEGIN;
UPDATE accounts SET balance = balance + 200 WHERE id = 2;  -- succeeds: 250
UPDATE accounts SET balance = balance - 200 WHERE id = 1;  -- ERROR: violates CHECK (balance >= 0)
COMMIT;  -- Postgres replies ROLLBACK; id=2 is back to 50
```

# Consistency

> This is NOT the same as the consistency in CAP theorem.

It is really a property of the application. The database can enforce some invariants (constraints, foreign keys, etc.) but beyond that it is the responsibility of the application to write transactions that keep the data valid.

*Note: This is more namesake according to many and just there to get the name "ACID".*

# Isolation

This means that concurrent transactions do not interfere with each other. Ideally, each transaction should behave as though it were running alone on the database. This is known as a serializable transaction. 

In practice, most databases provide a weaker level of isolation by default. Postgres provides Read Committed by default.

In my opinion, this is the most important part to understand when it comes to ACID compliance in a database.

## Anomalies

It is important to understand what can go wrong. Different databases implement different levels of isolation to handle each anomaly (some don't handle all anomalies).

Almost every anomaly prevention technique falls under one of three:
1. **Locking** : makes conflicting transactions wait
2. **Snapshots** : give each reader a consistent old version of data
3. **Conflict Detection** : lets transactions run freely, then aborts one of them to let the application retry

Let's look at the different types of anomalies that can occur in case of concurrent transactions:

### Dirty Write

Dirty write is when two writes are performed on the same object and the latter overwrites the former **before the former commits**.

**Example:** Alice and Bob trying to update the same rows.
```sql
-- Hypothetical interleaving if dirty writes were allowed:
-- Alice
BEGIN;
UPDATE accounts SET balance = 40 WHERE id = 1;
-- Bob
BEGIN;
UPDATE accounts SET balance = 50 WHERE id = 1;  -- in reality this blocks until Alice ends
UPDATE accounts SET balance = 50 WHERE id = 2;
COMMIT;
-- Alice
UPDATE accounts SET balance = 40 WHERE id = 2;
COMMIT;
-- Result: id=1 is 50 (Bob's), id=2 is 40 (Alice's), which no serial order produces
```

{{< tx-animation id="dirty-write" >}}
{
  "initialDb": [{"key": "id=1", "val": "—"}, {"key": "id=2", "val": "—"}],
  "steps": [
    {"actor": "alice", "text": "BEGIN;"},
    {"actor": "alice", "text": "UPDATE id=1 → 40", "db": [{"key": "id=1", "val": "40 ⌛"}]},
    {"actor": "bob", "text": "BEGIN;"},
    {"actor": "bob", "text": "UPDATE id=1 → 50", "note": "Overwrites Alice's uncommitted 40!", "db": [{"key": "id=1", "val": "50 ⌛"}]},
    {"actor": "bob", "text": "UPDATE id=2 → 50", "db": [{"key": "id=2", "val": "50 ⌛"}]},
    {"actor": "bob", "text": "COMMIT ✓", "db": [{"key": "id=1", "val": "50"}, {"key": "id=2", "val": "50"}]},
    {"actor": "alice", "text": "UPDATE id=2 → 40", "db": [{"key": "id=2", "val": "40 ⌛"}]},
    {"actor": "alice", "text": "COMMIT ✓", "db": [{"key": "id=1", "val": "50"}, {"key": "id=2", "val": "40"}]}
  ],
  "result": {"text": "id=1 = 50 (Bob's), id=2 = 40 (Alice's) — no serial order produces this. It's a mix of both transactions.", "type": "error"}
}
{{< /tx-animation >}}

This is generally blocked by all databases by default due to the presence of row-level write locks. In practice, once Alice calls `UPDATE`, Bob is blocked on the update until Alice's transaction commits or rolls back.

#### Prevention

Row-level write locks work and every database uses them. The second writer waits for the first to finish.

### Dirty Read

When a transaction reads an uncommitted value written by another transaction.

**Example:** Alice tries to read a row while Bob is updating the same row.
```sql
-- id=1 balance 100
-- Bob
BEGIN;
UPDATE accounts SET balance = 50 WHERE id = 1;
-- Alice
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- 50 if dirty reads allowed; 100 in Postgres at any level
COMMIT;
-- Bob
ROLLBACK;  -- the 50 Alice saw never existed
```

{{< tx-animation id="dirty-read" >}}
{
  "initialDb": [{"key": "id=1", "val": "100"}],
  "steps": [
    {"actor": "bob", "text": "BEGIN;"},
    {"actor": "bob", "text": "UPDATE id=1 → 50", "db": [{"key": "id=1", "val": "50 ⌛"}]},
    {"actor": "alice", "text": "BEGIN;"},
    {"actor": "alice", "text": "SELECT id=1 → 50", "note": "Reads Bob's uncommitted write!"},
    {"actor": "alice", "text": "COMMIT ✓"},
    {"actor": "bob", "text": "ROLLBACK ✗", "note": "The 50 never existed!", "status": "error", "db": [{"key": "id=1", "val": "100"}]}
  ],
  "result": {"text": "Alice read 50 — a value that was rolled back and never actually existed.", "type": "error"}
}
{{< /tx-animation >}}

Note: Postgres does not allow dirty reads even at the default isolation level. While it has a Read Uncommitted isolation level, it treats it as Read Committed.

#### Prevention

1. Lock-based approach: readers to acquire a short read lock which blocks while a writer holds the lock, which is slow.
2. Most databases use MVCC: while a write is in progress, the reader is given the last committed snapshot of the row.

### Non-repeatable Read

When two concurrent transactions are acting on the same row wherein one transaction is reading the row more than once and the other transaction is updating the row. This is often also called Read Skew. Here, the first transaction reads different values in the row because the second transaction updated the row and then committed before subsequent reads.

**Example:** Alice tries to read a row twice meanwhile Bob updates the row and commits.
```sql
-- Alice
BEGIN;  -- default READ COMMITTED
SELECT balance FROM accounts WHERE id = 1;  -- 100
-- Bob
BEGIN;
UPDATE accounts SET balance = 50 WHERE id = 1;
COMMIT;
-- Alice
SELECT balance FROM accounts WHERE id = 1;  -- 50 under READ COMMITTED; 100 under REPEATABLE READ
COMMIT;
```

{{< tx-animation id="non-repeatable-read" >}}
{
  "initialDb": [{"key": "id=1", "val": "100"}],
  "steps": [
    {"actor": "alice", "text": "BEGIN; (READ COMMITTED)"},
    {"actor": "alice", "text": "SELECT id=1 → 100", "note": "First read"},
    {"actor": "bob", "text": "BEGIN;"},
    {"actor": "bob", "text": "UPDATE id=1 → 50", "db": [{"key": "id=1", "val": "50 ⌛"}]},
    {"actor": "bob", "text": "COMMIT ✓", "db": [{"key": "id=1", "val": "50"}]},
    {"actor": "alice", "text": "SELECT id=1 → 50", "note": "Different value! (Read Skew)"},
    {"actor": "alice", "text": "COMMIT ✓"}
  ],
  "result": {"text": "Alice saw 100 then 50 within the same transaction. Under REPEATABLE READ, both reads would return 100.", "type": "error"}
}
{{< /tx-animation >}}

You might ask, why do we need another category just because this time we are considering a transaction to have committed but in dirty read we weren't? 

That's because the different levels of isolation prevent different anomalies.

Read Committed isolation level prevents dirty reads through different mechanisms. A lock-based implementation would make the reader take short read locks which the write lock blocks. This performs badly, so most databases, Postgres included, return the last committed version using MVCC. So each statement in the transaction sees the last committed snapshot of the rows in scope.

#### Prevention

Unlike the previous one where a fresh snapshot is taken for every statement, here use one snapshot for the whole transaction i.e. Snapshot Isolation.

### Phantom Read

When a transaction runs a predicate (search query) and another transaction inserts, updates or deletes rows so the set matching the predicate changes, and the first transaction runs the query and gets a different set.

**Example:** Alice tries to search for all accounts with balance 100 (gets 1) and then Bob adds 50 more to his initial balance of 50 before Alice's transaction commits. Then Alice runs the search again and commits.
```sql
-- id=1 balance 100, id=2 balance 50
-- Alice
BEGIN;
SELECT COUNT(*) FROM accounts WHERE balance = 100;  -- 1
-- Bob
BEGIN;
UPDATE accounts SET balance = balance + 50 WHERE id = 2;
-- (an INSERT of a row with balance 100 would work too)
COMMIT;
-- Alice
SELECT COUNT(*) FROM accounts WHERE balance = 100;  -- 2 under READ COMMITTED (phantom); 1 under REPEATABLE READ
COMMIT;
```

{{< tx-animation id="phantom-read" >}}
{
  "initialDb": [{"key": "id=1", "val": "100"}, {"key": "id=2", "val": "50"}],
  "steps": [
    {"actor": "alice", "text": "BEGIN;"},
    {"actor": "alice", "text": "SELECT COUNT(*) WHERE bal=100", "note": "→ 1 row matches"},
    {"actor": "bob", "text": "BEGIN;"},
    {"actor": "bob", "text": "UPDATE id=2 balance += 50", "db": [{"key": "id=2", "val": "100 ⌛"}]},
    {"actor": "bob", "text": "COMMIT ✓", "db": [{"key": "id=2", "val": "100"}]},
    {"actor": "alice", "text": "SELECT COUNT(*) WHERE bal=100", "note": "→ 2 rows! A phantom appeared"},
    {"actor": "alice", "text": "COMMIT ✓"}
  ],
  "result": {"text": "A new row appeared matching Alice's query — Bob's update created a phantom. Under REPEATABLE READ, the count stays at 1.", "type": "error"}
}
{{< /tx-animation >}}

The general solution in this situation is using predicate locks.

In systems like Postgres, at Repeatable Read isolation level, this is handled well using Snapshot Isolation wherein a transaction sees only a snapshot of the database with a timestamp right before the first statement of the transaction executes.

In Postgres' Repeatable Read isolation, if you try to update or lock a row that another concurrent transaction has modified with a timestamp later than the snapshot this first transaction is referring to, then an error is thrown on the write itself and the transaction rolls back.

#### Prevention

As long as the predicate is being used to only read, snapshot isolation handles this. If you are writing back to the database based on the result of the predicate then you would need the transaction to be serializable.

### Lost Update

When two transactions do read-modify-write cycles on the same row, the later write overwrites the earlier write without having seen it so one of the modifications is lost.

The problem here is not the same as a dirty write where a transaction overwrites another transaction's **uncommitted** write. Here, the write is committed, it's just that the read of the other transaction happens before the write was committed.

**Example:** Alice adds 10 and Bob adds 20 to the same account. Both read the balance first, then write back the value their application computed.
```sql
-- id=1 balance 100
-- Alice
BEGIN;
SELECT balance FROM accounts WHERE id = 1; -- 100
-- Bob
BEGIN;
SELECT balance FROM accounts WHERE id = 1; -- 100
-- Alice (application computes 100 + 10)
UPDATE accounts SET balance = 110 WHERE id = 1;
COMMIT;
-- Bob (application computes 100 + 20)
UPDATE accounts SET balance = 120 WHERE id = 1;
COMMIT;

-- final balance = 120, but both serial orders give 130
```

{{< tx-animation id="lost-update" >}}
{
  "initialDb": [{"key": "id=1", "val": "100"}],
  "steps": [
    {"actor": "alice", "text": "BEGIN;"},
    {"actor": "alice", "text": "SELECT id=1 → 100", "note": "Reads balance"},
    {"actor": "bob", "text": "BEGIN;"},
    {"actor": "bob", "text": "SELECT id=1 → 100", "note": "Also reads balance"},
    {"actor": "alice", "text": "UPDATE id=1 → 110", "note": "App computes 100 + 10", "db": [{"key": "id=1", "val": "110 ⌛"}]},
    {"actor": "alice", "text": "COMMIT ✓", "db": [{"key": "id=1", "val": "110"}]},
    {"actor": "bob", "text": "UPDATE id=1 → 120", "note": "App computes 100 + 20 (stale!)", "db": [{"key": "id=1", "val": "120 ⌛"}]},
    {"actor": "bob", "text": "COMMIT ✓", "db": [{"key": "id=1", "val": "120"}]}
  ],
  "result": {"text": "Final balance = 120, but both serial orders give 130. Alice's +10 is gone — a lost update.", "type": "error"}
}
{{< /tx-animation >}}

Under Read Committed in Postgres this succeeds and Alice's update is lost. Under Repeatable Read, Bob's `UPDATE` fails with `could not serialize access due to concurrent update` (SQLSTATE `40001`), because the row was modified by a transaction that committed after Bob's snapshot was taken. Bob must retry the whole transaction.

#### Prevention

1. **Atomic Updates:** Let the database do the whole read-modify-write in one statement like `SET balance = balance + 20`, this is safe even at Read Committed.
2. **Explicit Lock:** Use `SELECT ... FOR UPDATE` so the second transaction waits for the first to finish.
3. **Compare-and-Set:** Add `WHERE balance = 100` to the update and retry if no rows are updated.
4. **Automatic Detection:** Use Postgres Repeatable Read, which aborts the second writer with `40001`, and retry.

*Note: Not every snapshot isolation implementation detects lost updates. MySQL/InnoDB's Repeatable Read, for example, does not.*

### Serialization Anomaly

A common anomaly under this is Write Skew. Two transactions read overlapping data, each makes a decision based on what it read, and each writes a different object. Each write invalidates the premise of the other.

**Example:** Alice computes the total balance of accounts of type 1 and creates an entry of type 2 with the total balance as balance. Bob computes the total balance of all accounts of type 2 and creates an entry of type 1 with the total balance as balance.
```sql
-- rows (type, balance): (1,10), (1,20), (2,50), (2,60)
-- Alice
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT SUM(balance) FROM accounts WHERE type = 1;  -- 30
-- Bob
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT SUM(balance) FROM accounts WHERE type = 2;  -- 110
INSERT INTO accounts (type, balance) VALUES (1, 110);
COMMIT;
-- Alice
INSERT INTO accounts (type, balance) VALUES (2, 30);
COMMIT;  -- succeeds: write skew
-- Rerun with BEGIN ISOLATION LEVEL SERIALIZABLE: one transaction fails
-- with SQLSTATE 40001 (serialization_failure) and must be retried.
```

{{< tx-animation id="write-skew" >}}
{
  "initialDb": [{"key": "type=1 sum", "val": "30"}, {"key": "type=2 sum", "val": "110"}],
  "steps": [
    {"actor": "alice", "text": "BEGIN REPEATABLE READ;"},
    {"actor": "alice", "text": "SELECT SUM WHERE type=1", "note": "→ 30"},
    {"actor": "bob", "text": "BEGIN REPEATABLE READ;"},
    {"actor": "bob", "text": "SELECT SUM WHERE type=2", "note": "→ 110"},
    {"actor": "bob", "text": "INSERT (type=1, bal=110)", "db": [{"key": "type=1 sum", "val": "140"}]},
    {"actor": "bob", "text": "COMMIT ✓"},
    {"actor": "alice", "text": "INSERT (type=2, bal=30)", "db": [{"key": "type=2 sum", "val": "140"}]},
    {"actor": "alice", "text": "COMMIT ✓", "note": "Write skew — succeeds!"}
  ],
  "result": {"text": "Both transactions used stale sums to decide what to insert. Each INSERT invalidated the other's premise. Under SERIALIZABLE, one would be aborted.", "type": "error"}
}
{{< /tx-animation >}}

This is where the concept of Serialization comes in. It states that a set of concurrent transactions is called serializable if there exists at least one serial ordering that gives the same result as the concurrent execution of transactions.

#### Prevention

The general fix is true serializability. Postgres provides it with SSI: it tracks what each transaction read and aborts on dangerous read/write dependency patterns, and you retry. Other databases use two-phase locking or run transactions serially. Without Serializable, turn the problem into a write-write conflict:
- Lock the rows your decision depends on with `FOR UPDATE`. This only works if those rows already exist.
- Materialize the conflict into a row that both transactions update.
- Use an advisory lock on a shared key.
- Encode the invariant as a constraint, such as `UNIQUE` or an exclusion constraint.

# Durability

It is the promise that after a transaction has committed successfully, any data it has written will not be forgotten even if there is a hardware fault or the database crashes.

For a single node this usually means that the data has been successfully written to non-volatile storage like HDD/SSD. It is achieved in Postgres via Write-Ahead Log (WAL) flushed to disk using `fsync` before the commit is acknowledged. In Postgres, `synchronous_commit = off` deliberately trades off a little durability for speed.

For distributed databases, replication also becomes equally important. Here durability usually means that data has been successfully copied to a certain number of nodes.

---

## References

1. PostgreSQL Global Development Group. *PostgreSQL Documentation*, Chapter 13: Concurrency Control. https://www.postgresql.org/docs/current/mvcc.html
2. Kleppmann, M. & Riccomini, C. *Designing Data-Intensive Applications*, 2nd ed., Chapter 8: Transactions. O'Reilly Media.
3. Berenson, H., Bernstein, P., Gray, J., Melton, J., O'Neil, E. & O'Neil, P. (1995). "A Critique of ANSI SQL Isolation Levels." *Proceedings of the 1995 ACM SIGMOD International Conference on Management of Data*, pp. 1–10. https://doi.org/10.1145/223784.223785
