import { describe, it, expect } from 'vitest';
import { splitStarterCode, combineCode } from '@/components/CodeEditor';

describe('splitStarterCode()', () => {
  it('html category: puts all code in html slot', () => {
    const result = splitStarterCode('<p>hi</p>', 'html');
    expect(result.html).toBe('<p>hi</p>');
    expect(result.css).toBe('');
    expect(result.js).toBe('');
  });

  it('react category: puts all code in html slot', () => {
    const result = splitStarterCode('<App />', 'react');
    expect(result.html).toBe('<App />');
    expect(result.css).toBe('');
    expect(result.js).toBe('');
  });

  it('python category: puts all code in js slot', () => {
    const result = splitStarterCode('print("hi")', 'python');
    expect(result.js).toBe('print("hi")');
    expect(result.html).toBe('');
    expect(result.css).toBe('');
  });

  it('csharp category: puts all code in js slot', () => {
    const result = splitStarterCode('Console.WriteLine("hi");', 'csharp');
    expect(result.js).toBe('Console.WriteLine("hi");');
  });

  it('html_css_js: extracts style and script block content', () => {
    const code = '<p>hi</p><style>body{margin:0}</style><script>console.log(1)</script>';
    const result = splitStarterCode(code, 'html_css_js');
    expect(result.css).toBe('body{margin:0}');
    expect(result.js).toBe('console.log(1)');
    expect(result.html).not.toContain('<style>');
    expect(result.html).not.toContain('<script>');
  });

  it('html_css_js: html without style/script leaves css and js empty', () => {
    const result = splitStarterCode('<h1>Hello</h1>', 'html_css_js');
    expect(result.html).toBe('<h1>Hello</h1>');
    expect(result.css).toBe('');
    expect(result.js).toBe('');
  });
});

describe('combineCode()', () => {
  it('python category: returns js slot directly', () => {
    expect(combineCode({ html: '', css: '', js: 'print(1)' }, 'python')).toBe('print(1)');
  });

  it('csharp category: returns js slot directly', () => {
    expect(combineCode({ html: '', css: '', js: 'var x = 1;' }, 'csharp')).toBe('var x = 1;');
  });

  it('react category: returns html slot (or js as fallback)', () => {
    expect(combineCode({ html: '<App />', css: '', js: '' }, 'react')).toBe('<App />');
  });

  it('html_css_js: injects style into head when </head> exists', () => {
    const tabs = {
      html: '<html><head></head><body></body></html>',
      css: 'body{margin:0}',
      js: '',
    };
    const result = combineCode(tabs, 'html_css_js');
    expect(result).toContain('<style>\nbody{margin:0}\n</style>');
    expect(result).toContain('</head>');
  });

  it('html_css_js: injects script into body when </body> exists', () => {
    const tabs = {
      html: '<html><head></head><body></body></html>',
      css: '',
      js: 'alert(1)',
    };
    const result = combineCode(tabs, 'html_css_js');
    expect(result).toContain('<script>\nalert(1)\n</script>');
    expect(result).toContain('</body>');
  });

  it('html_css_js: prepends style when no </head> tag', () => {
    const tabs = { html: '<p>hi</p>', css: 'p{color:red}', js: '' };
    const result = combineCode(tabs, 'html_css_js');
    expect(result).toContain('<style>\np{color:red}\n</style>');
  });

  it('html_css_js: skips empty css and js', () => {
    const tabs = { html: '<p>hi</p>', css: '', js: '' };
    const result = combineCode(tabs, 'html_css_js');
    expect(result).toBe('<p>hi</p>');
  });
});

describe('splitStarterCode + combineCode roundtrip', () => {
  it('split then combine preserves css and js content', () => {
    const original = '<html><head><style>h1{color:red}</style></head><body><p>hi</p><script>var x=1</script></body></html>';
    const split = splitStarterCode(original, 'html_css_js');
    const recombined = combineCode(split, 'html_css_js');
    expect(recombined).toContain('h1{color:red}');
    expect(recombined).toContain('var x=1');
    expect(recombined).toContain('<p>hi</p>');
  });
});
