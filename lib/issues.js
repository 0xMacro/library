const endent = require('endent').default

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

exports.severityNames = {
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

// Final report title lines should have a single format:
//   ## (H-1) Not good thing
//
// Markdown title lines have more variability:
//   ### [H-1] Not good thing
//   ## (H-1) Also not good
//   **[G-1]** Gassy code
//
// This RegExps will select any of these formats
const ISSUE_TAG_RE = `[\\(\\[<](([CHMLQIG])-[0-9]+)[\\)\\]>]`
const TITLE_LINE_RE = `^(#{1,3} +)?\\*{0,2}${ISSUE_TAG_RE}\\*{0,2} +(.+)`

exports.statusNames = STATUSES

exports.normalize = function normalizeIssue(issue) {
  validateBaseRequiredFields(issue, BASE_REQUIRED_FIELDS)

  const [firstLine, ...contentLines] = issue.content.split('\n')
  const { tag, severity, title } = parseTitleLine(firstLine)
  return {
    ...issue,
    tag,
    title,
    impact: severity === 'I' ? 'informational' : issue.impact,
    status: severity === 'I' ? 'informational' : issue.status,
    isVuln: ['C','H', 'M', 'L'].includes(severity),
    content: contentLines.join('\n'),
    severity,
  }
}

function parseTitleLine(titleLine) {
  const [,, tag, severity, title] = titleLine.match(new RegExp(TITLE_LINE_RE))
  return { tag, severity, title }
}

exports.validate = function validateIssue(issue) {
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
  else if ((issue.commit || issue.commitTree) && issue.status !== 'fixed' && issue.status !== 'addressed') {
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

exports.parseNotionMarkdownIssues = function parseNotionMarkdownIssues(markdown) {
  return markdown.split(new RegExp(`(?=${TITLE_LINE_RE})`))
    .filter(x => !x.match(/^[\s\n]*$/))
    .map(issueContent => {
      let impact = ''
      let chance = ''

      const [firstLine, ...contentLines] = issueContent.trim().split('\n')
      const { tag, severity, title } = parseTitleLine(firstLine)

      // Normalize markdown title format for the final report:
      //  ## [H-1] Not good thing
      const issueTitle = `## (${tag}) ${title}`
      let issueBody = contentLines.join('\n')

      // SORRY WINDOWS
      const impactMatch = issueBody.match(IMPACT_LABEL_RE)
      if (impactMatch) {
        impact = impactMatch[1].match(/spec/i) ? 'spec' : impactMatch[1].toLowerCase()
        if (!IMPACT_SEVERITIES.includes(impact)) {
          throw new Error(`Invalid impact: ${impact}`)
        }
        issueBody = issueBody.replace(IMPACT_LABEL_RE, '')
      }
      const chanceMatch = issueBody.match(CHANCE_LABEL_RE)
      if (chanceMatch) {
        chance = chanceMatch[1].toLowerCase()
        if (!CHANCE_SEVERITIES.includes(chance)) {
          throw new Error(`Invalid chance: ${chance}`)
        }
        issueBody = issueBody.replace(CHANCE_LABEL_RE, '')
      }

      //Remove all empty leading lines
      issueBody = issueBody.replace(/^( *\n)+(.*)$/gm, '$2')

      return {
        impact,
        chance,
        severity,
        content: issueTitle + '\n\n' + issueBody,
      }
    })
}

exports.notionIssueToLancerCollectionItem = function notionIssueToLancerCollectionItem(issue) {
  const indentedContent = issue.content.replace(/^(?!\s*$)/gm, '    ')
  return endent(`
    <item>
      <field name="topic">TODO</field>
      <field name="impact">${issue.impact || 'TODO'}</field>__CHANCE__
      <field name="status">TODO</field>
      <field name="commit">TODO</field>
      <field name="content">
    __CONTENT__
      </field>
    </item>
  `)
    .replace('__CONTENT__', indentedContent)
    .replace('__CHANCE__',
      ['C','H','M','L'].includes(issue.severity)
      ? `\n  <field name="chance">${issue.chance}</field>`
      : ''
    )
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
