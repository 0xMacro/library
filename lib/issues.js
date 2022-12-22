import endent from 'endent'

const BASE_REQUIRED_FIELDS = [
  'content',
  'topic',
]

const ALL_REQUIRED_FIELDS = [
  ...BASE_REQUIRED_FIELDS,
  'severity',
  'impact',
  'status',
  'tag',
  'title',
]

const STATUSES = {
  ack: 'Acknowledged',
  fixed: 'Fixed',
  fixedprivate: 'Fixed',
  wontdo: 'Wont Do',
  addressed: 'Addressed',
}

const IMPACT_SEVERITIES = [
  'spec',
  'high',
  'medium',
  'low',
]

const CHANCE_SEVERITIES = [
  'high',
  'medium',
  'low',
]

export const severityNames = {
  'C': 'Critical',
  'H': 'High',
  'M': 'Medium',
  'L': 'Low',
  'Q': 'Code Quality',
  'I': 'Informational',
  'G': 'Gas Optimization',

  'critical': 'Critical',
  'high': 'High',
  'medium': 'Medium',
  'low': 'Low',
  'spec': 'Spec Breaking',
}

export const statusNames = STATUSES

export function isAddressed(status) {
  return status === 'fixed' || status === 'fixedprivate' || status === 'addressed'
}

export function normalize(issue) {
  validateBaseRequiredFields(issue, BASE_REQUIRED_FIELDS)

  const [firstLine, ...contentLines] = issue.content.split('\n')
  const { tag, severity, title } = parseTitleLine(firstLine)
  return {
    ...issue,
    tag,
    title,
    impact: severity === 'I' ? 'informational' : issue.impact,
    status: severity === 'I' && !issue.status ? 'informational' : issue.status,
    isVuln: ['C','H', 'M', 'L'].includes(severity),
    content: contentLines.join('\n'),
    severity,
  }
}

function parseTitleLine(titleLine) {
  const [, tag, severity, title] = titleLine.match(/^## +[\(\[](([CHMLQIG])-[0-9]+)[\)\]] +(.+)/)
  return { tag, severity, title }
}

export function validate(issue) {
  validateBaseRequiredFields(issue, ALL_REQUIRED_FIELDS)

  let valid

  if (! (valid = Object.keys(STATUSES)).includes(issue.status) && issue.severity !== 'I') {
    throw new Error(`Invalid issue status: '${issue.status}'. Valid options: ${valid.join(', ')} (for issue: ${estimateIssuePreview(issue)})`)
  }
  if (! (valid = IMPACT_SEVERITIES).includes(issue.impact) && issue.severity !== 'I') {
    throw new Error(`Invalid issue impact: '${issue.impact}'. Valid options: ${valid.join(', ')} (for issue: ${estimateIssuePreview(issue)})`)
  }
  if (issue.status === 'fixed' && !issue.commit && !issue.commitTree) {
    throw new Error(`Fixed issue missing 'commit' or 'commitTree' field (for issue: ${estimateIssuePreview(issue)})`)
  }
  else if (issue.status === 'fixedprivate' && (issue.commit || issue.commitTree)) {
    throw new Error(`FixedPrivate issue cannot have 'commit' or 'commitTree' field (for issue: ${estimateIssuePreview(issue)})`)
  }
  else if ((issue.commit || issue.commitTree || issue.repoPath) && issue.status !== 'fixed' && issue.status !== 'addressed') {
    throw new Error(`Do not provide a 'commit' or 'commitTree' field when issue is not 'fixed' or 'addressed' (for issue: ${estimateIssuePreview(issue)})`)
  }

  if (issue.isVuln && !issue.chance) {
    throw new Error(`'chance' field required for High, Medium, and Low severity issues (for issue: ${estimateIssuePreview(issue)})`)
  }
  else if (!issue.isVuln && issue.chance) {
    throw new Error(`Do not use the 'chance' field for Code Quality or Gas Opt issues (for issue: ${estimateIssuePreview(issue)})`)
  }

  if (issue.isVuln && !(valid = CHANCE_SEVERITIES).includes(issue.chance)) {
    throw new Error(`Invalid issue chance: '${issue.chance}'. Valid options: ${valid.join(', ')}`)
  }
}

const IMPACT_LABEL_RE = /(?:\*\*)?Impact(?:\*\*)?:(?:\*\*)? ([^\n]+)?/
const CHANCE_LABEL_RE = /(?:\*\*)?Likelihood(?:\*\*)?:(?:\*\*)? ([^\n]+)?/

export function parseNotionMarkdownIssues(markdown) {
  return markdown.split(/(?=##\s+[\(\[][CHMLQGI]-\d[\)\]])/)
    .filter(x => !x.match(/^[\s\n]*$/))
    .map(issueContent => {
      issueContent = issueContent.trim()
      let impact = ''
      let chance = ''

      const { severity } = parseTitleLine(issueContent.split('\n')[0])

      // SORRY WINDOWS
      const impactMatch = issueContent.match(IMPACT_LABEL_RE)
      if (impactMatch) {
        impact = impactMatch[1].match(/spec/i) ? 'spec' : impactMatch[1].toLowerCase()
        if (!IMPACT_SEVERITIES.includes(impact)) {
          throw new Error(`Invalid impact: ${impact}`)
        }
      }
      const chanceMatch = issueContent.match(CHANCE_LABEL_RE)
      if (chanceMatch) {
        chance = chanceMatch[1].toLowerCase()
        if (!CHANCE_SEVERITIES.includes(chance)) {
          throw new Error(`Invalid chance: ${chance}`)
        }
      }
      return {
        impact,
        chance,
        severity,
        content: issueContent
          .replace(IMPACT_LABEL_RE, '')
          .replace(CHANCE_LABEL_RE, '')
          .replace(/(## [^\n]+)\n+/g, '$1\n\n') // Consolidate extra newlines
        ,
      }
    })
}

export function notionIssueToLancerCollectionItem(issue) {
  const indentedContent = issue.content.replace(/^(?!\s*$)/gm, '    ')
  return endent(`
    <item>
      <field name="topic">TODO</field>__IMPACT____CHANCE____STATUS__
      <field name="content">
    __CONTENT__
      </field>
    </item>
  `)
    .replace('__IMPACT__',
      ['C','H','M','L','Q'].includes(issue.severity)
      ? `\n  <field name="impact">${issue.impact || 'TODO'}</field>`
      : ''
    )
    .replace('__CHANCE__',
      ['C','H','M','L'].includes(issue.severity)
      ? `\n  <field name="chance">${issue.chance || 'TODO'}</field>`
      : ''
    )
    .replace('__STATUS__',
      ['C','H','M','L','Q'].includes(issue.severity)
      ? `\n  <field name="status">TODO</field>\n  <field name="commit">TODO</field>`
      : ''
    )
    .replace('__CONTENT__', indentedContent)
}

function validateBaseRequiredFields(issue, fields) {
  for(let field of fields) {
    if (! issue[field]) {
      throw new Error(`Issue missing required field: '${field}' for issue: ${estimateIssuePreview(issue)}`)
    }
  }
}

function estimateIssuePreview(issue) {
  return issue.title || issue.content.split('\n').filter(x => x)[0]
}
