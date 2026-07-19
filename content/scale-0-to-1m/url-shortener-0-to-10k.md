---
title: "URL Shortener: 0 to 1K"
date: 2026-06-20T15:16:05+05:30
draft: true
description: "How a URL shortener looks when you're just getting started — and what breaks first."
tags: ["system-design", "hld", "scaling reads"]
series: ["url-shortener"]
weight: 1
ShowToc: true
TocOpen: false
cover:
  image: ""
  alt: ""
  caption: ""
---

## The Setup

As with any system design, you first need requirements as they help you set the context and decide the boundaries of your system. 

### Functional Requirements
1. Given a long URL, return a much shorter URL
2. When user enters the short URL, they should be redirected to the original URL

Pretty straightforward use cases for now. Let's move on to non-functional requirements.
Let's talk about the scale briefly. You want to support 1K users. You could assume that a user would create 1 short URL per-day and there would be at least 10 URL redirects per user per-day.

### Non-Functional Requirements
1. Low-latency redirects (<100ms p99)
2. 

## What Breaks First

[The single biggest bottleneck at this tier. Be specific.]

## The Fix

[What you actually change. Include a diagram or code/config snippet if relevant.]

## The Over-Engineering Trap

[What it would be tempting to add at this tier that you DON'T need yet — and why.]

## What This Sets Up For Next Tier

[1-2 sentences bridging to the next post.]
