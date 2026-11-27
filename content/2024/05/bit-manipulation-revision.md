---
title: "Bit Manipulation Revision Guide"
description: "A comprehensive guide and cheat sheet for bit manipulation in Python, including basic operators, common tricks, and built-in functions."
date: "2024-05-24"
tags: "Python, Algorithms, Bit Manipulation"
slug: "bit-manipulation-revision"
author: "Cenz Wong"
---

# Bit Manipulation Revision Guide

Bit manipulation is a crucial skill for optimizing algorithms and solving competitive programming problems. This guide serves as a quick revision sheet covering basic operators, common tricks, and useful Python built-in functions.

## Basic Bitwise Operators

Understanding the fundamental bitwise operators is the first step in mastering bit manipulation.

| Operator | Meaning | Usage |
| :--- | :--- | :--- |
| `&` | AND | Masking, checking specific bits. |
| `\|` | OR | Setting specific bits to 1. |
| `^` | XOR | Flipping bits, finding differences, canceling out duplicate values. |
| `~` | NOT | Bit inversion (Note: Be aware of Python's two's complement representation for negative numbers). |
| `<<` | Left Shift | Multiply a number by $2^n$ (shifting bits to the left). |
| `>>` | Right Shift | Divide a number by $2^n$ (shifting bits to the right). |

## Python Built-in Functions

Python provides several handy built-in functions to work with binary representations.

- `bin(n)`: Converts an integer to a binary string representation.
  ```python run
  bin(10) # Returns '0b1010'
  ```

- `int(str, 2)`: Converts a binary string back to an integer.
  ```python run
  int('1010', 2) # Returns 10
  ```

- `n.bit_length()`: Quickly determines how many bits are required to store a number.
  ```python run
  (10).bit_length() # Returns 4
  ```

- `n.bit_count()`: (Available in Python 3.10+) Directly counts the number of 1s in the binary representation of a number, eliminating the need to write a loop!
  ```python run
  (10).bit_count() # Returns 2
  ```

## Common Bit Manipulation Tricks

Here are some essential bit manipulation tricks and their applications:

### Checking and Modifying Specific Bits

- **Check if the $i$-th bit is 1:**
  ```python
  (n >> i) & 1
  ```
- **Set the $i$-th bit to 1:**
  ```python
  n | (1 << i)
  ```
- **Clear the $i$-th bit (set it to 0):**
  ```python
  n & ~(1 << i)
  ```

### Isolating and Clearing the Lowest Set Bit (LSB)

- **Clear the lowest set bit (the rightmost 1):**
  ```python
  n & (n - 1)
  ```
  *Application:* This is the core of **Brian Kernighan's Algorithm**, which is used to quickly count how many 1s are in a number.

- **Isolate the lowest set bit (keep only the rightmost 1):**
  ```python
  n & (-n)
  ```
  *Application:* Useful for finding the lowest set bit in a value (e.g., used in Fenwick Trees / Binary Indexed Trees).

### Other Useful Tricks

- **Check if a number is Even or Odd:**
  ```python
  n & 1
  ```
  *If the result is 1, it's odd; if 0, it's even.*

- **Check if a number is a Power of 2:**
  ```python
  (n > 0) and ((n & (n - 1)) == 0)
  ```
  *Since a power of 2 has exactly one bit set to 1, clearing that bit should result in 0.*

- **Multiply or Divide by Powers of 2:**
  - `n << k` is equivalent to multiplying by $2^k$.
  - `n >> k` is equivalent to dividing by $2^k$.

---

Keep these tricks in mind and practice them to speed up your problem-solving process!
