const o = require('ospec')
const { parseNotionMarkdownIssues } = require('../lib/issues')

o.spec('parseNotionMarkdownIssues', function() {

  o('splits by issue', () => {
    const result = parseNotionMarkdownIssues(`
      ## (H-1) a
      aaa
      ## (H-2) b
      bbb
      ## (Q-1) c
      ccc
    `)
    o(result.length).equals(3)
  })

  o('parses content', () => {
    const result = parseNotionMarkdownIssues(`
      ## (H-1) a
      aaa
      ## (H-2) b
      bbb
      ## (Q-1) c
      ccc
    `)
    o(result[0].content.includes('## (H-1) a\n')).equals(true)
    o(result[0].content.includes('(H-2)')).equals(false)
    o(result[0].content.includes('(Q-1)')).equals(false)
    o(result[0].content.includes('aaa')).equals(true)
    o(result[0].content.includes('bbb')).equals(false)
    o(result[0].content.includes('ccc')).equals(false)

    o(result[1].content.includes('## (H-2) b\n')).equals(true)
  })

  o('parses severity', () => {
    const result = parseNotionMarkdownIssues(`
      ## (H-1) a
      aaa
      ## (L-2) b
      bbb
      ## (Q-1) c
      ccc
    `)
    o(result[0].severity).equals('H')
    o(result[1].severity).equals('L')
    o(result[2].severity).equals('Q')
  })

  o('parses impact and chance', () => {
    const result = parseNotionMarkdownIssues(`
      ## (H-1) One

      **Impact:** Medium
      **Likelihood:** High

      High one

      ## (H-2) Two

      **Impact**: Spec-breaking

      Likelihood: High

      High two

      ## (H-3) Three

      Impact: Spec breaking

      **Likelihood**: Low

      High Three
    `)

    o(result[0].impact).equals('medium')
    o(result[0].chance).equals('high')
    o(result[0].content.includes('Impact')).equals(false)
    o(result[0].content.includes('Likelihood')).equals(false)

    o(result[1].impact).equals('spec')
    o(result[1].chance).equals('high')

    o(result[2].impact).equals('spec')
    o(result[2].chance).equals('low')
  })
})
