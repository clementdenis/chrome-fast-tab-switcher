const sections = (haystack, needle, remaining, acc, offset) => {
  if (!acc) acc = [];
  if (!remaining) remaining = "";
  if (!offset) offset = 0;

  needle = needle.trim();
  const index = haystack.toLowerCase().indexOf(needle.toLowerCase());
  if (index > -1) {
    if (remaining.length) {
      const remainingHaystack = haystack.substr(needle.length + index);
      const newAcc = acc.concat([[offset + index, offset + needle.length + index]]);
      return sections(remainingHaystack, remaining, null, newAcc, offset + needle.length + index);
    } else {
      return acc.concat([[offset + index, offset + needle.length + index]]);
    }
  } else if (needle.length > 1) {
    const nextNeedle = needle.substr(0, needle.length - 1);
    return sections(haystack, nextNeedle, needle.substr(needle.length - 1) + remaining, acc, offset);
  } else {
    return [];
  }
};

module.exports = (haystack, needle, pre, post) => {
  if (!pre) pre = '';
  if (!post) post = '';

  const matches = sections(haystack, needle);
  if (!matches.length) return haystack;
  let lastPos = 0;
  let result = '';

  for (const match of matches) {
    const start = match[0];
    const end = match[1];
    result += haystack.substring(lastPos, start);
    result += pre + haystack.substring(start, end) + post;
    lastPos = end;
  }

  result += haystack.substr(lastPos);

  return result;
};
