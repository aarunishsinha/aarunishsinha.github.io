---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
description: ""
tags: ["system-design", "hld", "scaling"]
series: [""]
weight: 1
ShowToc: true
TocOpen: false
cover:
  image: ""
  alt: ""
  caption: ""
---

## The Setup

[What does the system look like at this tier? Concrete numbers — QPS, data volume, user count.]

## What Breaks First

[The single biggest bottleneck at this tier. Be specific.]

## The Fix

[What you actually change. Include a diagram or code/config snippet if relevant.]

## The Over-Engineering Trap

[What it would be tempting to add at this tier that you DON'T need yet — and why.]

## What This Sets Up For Next Tier

[1-2 sentences bridging to the next post.]

