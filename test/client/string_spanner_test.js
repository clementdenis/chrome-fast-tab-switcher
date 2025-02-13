const s = require('../../src/js/client/string_spanner');

module.exports = {
  spansWholeStrings: function(test) {
    const spanned = s('React', 'React', '<b>', '</b>');
    test.equal(spanned, '<b>React</b>');
    test.done();
  },

  spansCaseInsensitive: function(test) {
    const spanned = s('React', 'react', '<b>', '</b>');
    test.equal(spanned, '<b>React</b>');
    test.done();
  },

  spansWithExtraAtEnd: function(test) {
    const spanned = s('React Documentation', 'React', '<b>', '</b>');
    test.equal(spanned, '<b>React</b> Documentation');
    test.done();
  },

  spansWithExtraAtFront: function(test) {
    const spanned = s('React Documentation', 'Documentation', '<b>', '</b>');
    test.equal(spanned, 'React <b>Documentation</b>');
    test.done();
  },

  spandsInMiddle: function(test) {
    const spanned = s('React Documentation', 'act Doc', '<b>', '</b>');
    test.equal(spanned, 'Re<b>act Doc</b>umentation');
    test.done();
  },

  spansAcross: function(test) {
    const spanned = s('React API Documentation', 'React Doc', '<b>', '</b>');
    test.equal(spanned, '<b>React</b> API <b>Doc</b>umentation');
    test.done();
  },

  doestSpanNonMatches: function(test) {
    const spanned = s('React API Documentation', 'React Docz', '<b>', '</b>');
    test.equal(spanned, 'React API Documentation');
    test.done();
  },

  ignoresSpacesWhenNecessary: function(test) {
    const spanned = s('React/API', 'React API', '<b>', '</b>');
    test.equal(spanned, '<b>React</b>/<b>API</b>');
    test.done();
  },

  triesReallyHard: function(test) {
    const needle = 'BinaryMuse';
    const haystack = 'http://www.brandonisnarywrong/but/must/use/stuff';
    const result = [
      'http://www.',
      '<span>b</span>',
      'randon',
      '<span>i</span>',
      's',
      '<span>nary</span>',
      'wrong/but/',
      '<span>mus</span>',
      't/us',
      '<span>e</span>',
      '/stuff'
    ].join('');
    const spanned = s(haystack, needle, '<span>', '</span>');
    test.equal(spanned, result);
    test.done();
  },

  doestHaveOffsetErrors: function(test) {
    const needle = 'twitter';
    const haystack = 'BinaryMuse/chrome-fast-tab-switcher at react-js';
    const spanned = s(haystack, needle, '<b>', '</b>');
    test.equal(spanned, haystack);
    test.done();
  }
};
