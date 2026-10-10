---
title: "Fibonacci: Can We Do Better?"
date: 2026-10-10T12:00:00+05:30
draft: false
description: "Computing fib(n) step by step from naive recursion, through dynamic programming and matrix exponentiation, to fast doubling. Asking the same question at every stage."
tags: ["algorithms", "dynamic-programming", "math", "fundamentals"]
math: true
ShowToc: true
TocOpen: true
cover:
  image: ""
  alt: ""
  caption: ""
---

# The Sequence

Most of us have encountered or heard about the Fibonacci sequence. It is an exponentially increasing sequence of numbers which starts with 0 and 1 and looks something like `0 1 1 2 3 5 8 13...`

It follows the relation:

> $fib(n) = fib(n-1) + fib(n-2)$ where $fib(0) = 0$ and $fib(1) = 1$

The interesting part for me is how you can calculate $fib(n)$ for any given $n$. It's something a lot of computer science students face in their first or second algorithms lecture.

# Algorithms

Let's explore the ways you can calculate $fib(n)$ step by step...

## Recursion

The simplest way is to use the above recurrence relation directly in a recursive setting.

> Base Case: `fib(0) = 0 & fib(1) = 1`\
> Recurrence relation: `fib(n) = fib(n-1) + fib(n-2)`

Your algorithm would look like:

```python
func fib(n):
	if (n == 0) result = 0
	else if (n == 1) result = 1
	else
		result = fib(n-1) + fib(n-2)
	return result
```

For a given $n$, we make two calls to $fib()$, which makes the time complexity for this algorithm $O(2^n)$, which is not great. Hence comes the question you've probably heard countless times:

{{< fib-better stage="1" >}}

Yes, we can.

## Memoization/Dynamic Programming

Look at the function call graph of the previous algorithm.

{{< fib-viz type="tree" n="6" >}}

We have repeated calls with the same input. You can store the result of $fib(k)$ on the first calculation and then use it afterwards. This is called memoization.

The algorithm would look like:

```python
memo[] = {}

func fib(n):
	if (n == 0) result = 0
	else if (n == 1) result = 1
	else if (memo[n] != null) result = memo[n]
	else
		result = fib(n-1) + fib(n-2)
		memo[n] = result
	return result
```

For each $k \in [0, n]$, $fib(k)$ is calculated only once, bringing the time complexity down to $O(n)$.

We went from exponential time complexity down to linear; that's a great leap. The above approach is also known as the "Top-down Dynamic Programming" approach. There's also the "Bottom-up Dynamic Programming" approach, which starts from $fib(0)$ and $fib(1)$ and builds up to $fib(n)$:

```python
func fib(n):
	dp[] = [0] * (n+1)
	dp[1] = 1
	for (i in 2 to n):
		dp[i] = dp[i-1] + dp[i-2]
	return dp[n]
```

{{< fib-viz type="dp" n="10" >}}

The time complexity remains the same for this approach; only the way we reach $fib(n)$ changes a bit. Both algorithms use linear space, $O(n)$, which grows with $n$ to account for `memo[]` in the top-down approach and `dp[]` in the bottom-up approach.

Let's look at the recurrence relation once more: $$fib(n) = fib(n-1) + fib(n-2)$$

To calculate $fib(n)$, it's enough to know $fib(n-1)$ and $fib(n-2)$. You need not store $fib(k) \ \forall \ k \in [0,n]$. By maintaining two variables that store $fib(n-1)$ and $fib(n-2)$, you can reach $fib(n)$ and bring the auxiliary space down to a constant, $O(1)$.

> **Assumption:** results are calculated as `fib(n) mod m`, where you can take `m = 1e9 + 7`. This ensures that the results fit in a 32-bit integer and arithmetic operations stay $O(1)$.

The algorithms discussed so far are plenty fast for reasonably large $n < 10^9$, but what happens when $n$ increases beyond that and a linear-time algorithm starts to feel slow? The good old question comes back:

{{< fib-better stage="2" >}}

Yes, we can.

## Matrix Exponentiation

This concept builds on Binary Exponentiation.

### Binary Exponentiation

To calculate $x^e$, you can multiply $x$ over and over $e$ times, but that is $O(e)$. This can actually be achieved in $O(log \ e)$ time using binary exponentiation. The simple idea behind it is that instead of multiplying $x$ over and over, you can repeatedly square $x$ and take only the powers needed to add up to $e$.

For example, to calculate $x^{13}$, first write the binary representation of $13$, which is $1101$. So,

$$x^{13} = x^1 \cdot x^4 \cdot x^8$$

By squaring $x$ over and over you can calculate $x^2$, $x^4$ and $x^8$.

{{< fib-viz type="pow" n="13" >}}

This brings the time down to $O(log \ e)$. For $e=10^9$ this would take about 30 operations compared to a billion operations before. (Read more at: [[3]](#ref-binary))

This method relies on the fact that multiplication is associative.

### Turning Fibonacci into a Matrix

The recurrence $fib(n) = fib(n-1) + fib(n-2)$ is linear: each new term is a fixed combination of the previous two. A linear rule like this can be represented as a matrix multiplying a vector:

$$
\begin{pmatrix} fib(n+1) \\ fib(n) \end{pmatrix} = \begin{pmatrix} 1 & 1 \\ 1 & 0 \end{pmatrix} \begin{pmatrix} fib(n) \\ fib(n-1) \end{pmatrix}
$$

Let $M$ be this matrix; then each multiplication by $M$ advances the sequence by one step. Starting from $fib(1)$ and $fib(0)$ and multiplying by $M$ $n$ times gives:

$$
M^n = \begin{pmatrix} fib(n+1) & fib(n) \\ fib(n) & fib(n-1) \end{pmatrix}
$$

You can see the sequence show up in the powers of $M$ that binary exponentiation computes:

$$
M^1 = \begin{pmatrix} 1 & 1 \\ 1 & 0 \end{pmatrix} \quad
M^2 = \begin{pmatrix} 2 & 1 \\ 1 & 1 \end{pmatrix} \quad
M^4 = \begin{pmatrix} 5 & 3 \\ 3 & 2 \end{pmatrix} \quad
M^8 = \begin{pmatrix} 34 & 21 \\ 21 & 13 \end{pmatrix}
$$

So, calculating $fib(n)$ reduces to computing $M^n$. Since matrix multiplication is also associative (for compatible matrices), binary exponentiation lets us compute it in $O(log \ n)$ as well. The algorithm looks like:

```python
func matMult(A, B, MOD):
	# A is n×m, B is m×p, result C is n×p
	create matrix C of size n×p filled with 0
	for i from 0 to n-1: 
		for j from 0 to p-1: 
			sum = 0 
			for k from 0 to m-1: 
				sum = sum + A[i][k] × B[k][j] 
			C[i][j] = sum % MOD 
	return C
	
func matPow(M, e, MOD):
	R = identity matrix, same size as M
	while (e > 0):
		if (e & 1):
			R = matMult(R, M, MOD)
		M = matMult(M, M, MOD)
		e = e >> 1
	return R
	
func fib(n, MOD):
	M = [[1, 1], [1, 0]]
	F_n = matPow(M, n, MOD)
	return F_n[0][1]
```

Matrix Exponentiation is not limited to the Fibonacci sequence; it works on any linear recurrence of order $k$. (Read more at: [[1]](#ref-adamant))

{{< fib-better stage="3" >}}

Yes, we can.

## Fast Doubling

Matrix exponentiation performs 8 multiplications at each step, which can be brought down to 3 using Fast Doubling. This approach is derived straight from Matrix Exponentiation and uses the following two identities:

$$fib(2n) = fib(n) \cdot (2 \cdot fib(n+1) - fib(n))$$

$$fib(2n+1) = fib(n)^2 + fib(n+1)^2$$

These let you jump from the pair $fib(k)$, $fib(k+1)$ to $fib(2k)$, $fib(2k+1)$. To reach any $n$, recurse on $k = n//2$. The algorithm looks like:

```python
func fastDouble(n, MOD): # return fib(n), fib(n+1)
	if (n == 0) return (0, 1)
	a, b = fastDouble(n>>1, MOD) # a = fib(k), b = fib(k+1), k = n//2
	c = a * ((2 * b - a) % MOD) % MOD
	d = ((a * a % MOD) + (b * b % MOD)) % MOD
	if (n & 1):
		return (d, (c + d) % MOD)
	else:
		return (c, d) 
```

{{< fib-viz type="doubling" n="13" >}}

For a detailed derivation of the above two identities, I would suggest reading [[4]](#ref-fastfib) and [[5]](#ref-lucas).

While this approach also achieves the same Big-O time complexity of $O(log \ n)$, it improves on the previous approach by a constant factor, reducing the number of multiplications at each step from 8 to 3.

{{< fib-better stage="4" >}}

Yes, we can, but with some caveats and constraints.

## Further Improvements

I shall briefly mention some approaches that improve upon what we have discussed so far:
- Binet's Formula uses a rounding-off approach that can essentially calculate the $n$th Fibonacci number in $O(1)$ time, but since it uses floating point, rounding errors make the result wrong somewhere around $n = 70$. [[2]](#ref-binet)
- There are faster ways to compute the modulus, like Montgomery or Barrett reduction.
- For exact values without modulus, multiplication operations dominate the running time and can be optimised using Fast Fourier Transform (FFT) based multiplication.

# Conclusion

Every speed-up here came from noticing something about the problem rather than writing cleverer code: the calls repeat (so memoize them), only the last two values matter (so keep two variables), the recurrence is linear (so turn it into a matrix and square it), and that matrix has structure (so use fast doubling).

In practice, a simple loop is all you need for small $n$. Once $n$ runs into the billions and you can work modulo $m$, matrix exponentiation or fast doubling gets you there in $O(\log n)$. And the next time someone asks *"Can we do better?"*, start by looking at the problem again, not the code.

---

# References

1. <span id="ref-adamant"></span>adamant. (2022). _On linear recurrences and the math behind them_ [Blog post]. Codeforces. [https://codeforces.com/blog/entry/100158](https://codeforces.com/blog/entry/100158)
2. <span id="ref-binet"></span>Art of Problem Solving. (n.d.). _Binet’s formula_. AoPS Wiki. Retrieved October 10, 2026, from [https://artofproblemsolving.com/wiki/index.php/Binet%27s_Formula](https://artofproblemsolving.com/wiki/index.php/Binet%27s_Formula)
3. <span id="ref-binary"></span>cp-algorithms contributors. (2026, June 10). _Binary exponentiation_. Algorithms for Competitive Programming. [https://cp-algorithms.com/algebra/binary-exp.html](https://cp-algorithms.com/algebra/binary-exp.html)
4. <span id="ref-fastfib"></span>Kumar, A. (2021, August 5). _Deriving the fast Fibonacci identities without matrices [O(log(n))]_. Medium. [https://medium.com/@ani1998ket/deriving-the-fast-fibonacci-identities-without-matrices-o-log-n-4cd9ce69d9d4](https://medium.com/@ani1998ket/deriving-the-fast-fibonacci-identities-without-matrices-o-log-n-4cd9ce69d9d4)
5. <span id="ref-lucas"></span>Wikipedia contributors. (n.d.). _Lucas number_. In _Wikipedia_. from [https://en.wikipedia.org/wiki/Lucas_number](https://en.wikipedia.org/wiki/Lucas_number)
