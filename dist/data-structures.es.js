function u(l = 0.5) {
  return Math.random() < l;
}
function v(l = 32) {
  let n = 1;
  for (; u() && n < l; )
    n++;
  return n;
}
class h {
  constructor(n, e) {
    this.value = n, this.next = new Array(e);
  }
}
var x;
class c {
  constructor(n = 32) {
    this.maxLengthOfValue = () => {
      let e = this.headerNode;
      for (; e.next[0]; )
        e = e.next[0];
      return `${e.value}`.length;
    }, this[x] = function* () {
      let e = this.headerNode.next[0];
      for (; e; )
        yield e.value, e = e.next[0];
    }, this.headerNode = new h(Number.MIN_SAFE_INTEGER, 32), this.maxLevels = n;
  }
  /**
   * Inserts a value into the skip list.
   * This method calculates the level for the new node and inserts it into the appropriate levels.
   * @param value The value to be inserted into the skip list.
   */
  insert(n) {
    const e = v(), t = new h(n, e);
    let r = this.headerNode;
    for (let i = e - 1; i >= 0; i--) {
      for (; r.next[i] && r.next[i].value < n; )
        r = r.next[i];
      t.next[i] = r.next[i], r.next[i] = t;
    }
  }
  /**
   * Deletes a value from the skip list.
   * This method traverses the list to find the node with the given value and removes it from the list.
   * @param value The value to be deleted from the skip list.
   * @returns true if the value was found and deleted, false otherwise.
   */
  delete(n) {
    let e = this.headerNode, t = !1;
    for (let r = this.maxLevels - 1; r >= 0; r--) {
      for (; e.next[r] !== void 0 && e.next[r].value < n; )
        e = e.next[r];
      e.next[r] !== void 0 && e.next[r].value === n && (t = !0, e.next[r] = e.next[r].next[r]);
    }
    return t;
  }
  /**
   *  Checks if the skip list contains a given value.
   * @param value The value to be checked for in the skip list.
   * @returns true if the value is found, false otherwise.
   */
  contains(n) {
    let e = this.headerNode;
    for (let t = this.maxLevels - 1; t >= 0; t--) {
      for (; e.next[t] !== void 0 && e.next[t].value < n; )
        e = e.next[t];
      if (e.next[t] !== void 0 && e.next[t].value === n)
        return !0;
    }
    return !1;
  }
  /**
   * Returns the value from the skip list if it exists.
   * @param value The value to be retrieved from the skip list.
   * @returns The value if it exists, undefined otherwise.
   */
  get(n) {
    let e = this.headerNode;
    for (let t = this.maxLevels - 1; t >= 0; t--) {
      for (; e.next[t] !== void 0 && e.next[t].value < n; )
        e = e.next[t];
      if (e.next[t] !== void 0 && e.next[t].value === n)
        return e.next[t].value;
    }
  }
  /**
   * Gets the index of a value in the skip list layer 1.
   * @param value The value to be checked for in the skip list.
   * @returns The index of the value if it exists, -1 otherwise.
   */
  indexOf(n) {
    let e = this.headerNode, t = 0;
    for (; e.next[0] && e.next[0].value < n; )
      t++, e = e.next[0];
    return e.next[0] && e.next[0].value === n ? t : -1;
  }
  size() {
    let n = this.headerNode, e = 0;
    for (; n.next[0]; )
      e++, n = n.next[0];
    return e;
  }
  /**
   * Returns a string representation of the skip list, showing the layout of values across different levels.
   * @returns A string representation of the skip list.
   */
  toPrettyString() {
    let n = "";
    const e = this.maxLengthOfValue();
    for (let t = this.maxLevels - 1; t >= 0; t--) {
      let r = [], i = this.headerNode.next[t];
      for (; i; )
        r.push(i.value), i = i.next[t];
      if (r.length > 0) {
        let o = this.size(), s = Array(o).fill(" ".repeat(e));
        r.forEach((a) => {
          const d = this.indexOf(a);
          s[d] = `${a}`.padStart(e, " ");
        }), n += `${t + 1}:	[${s.join(" ")}]
`;
      }
    }
    return n.trim();
  }
}
x = Symbol.iterator;
export {
  c as SkipList
};
