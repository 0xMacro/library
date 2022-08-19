
const BASE_REQUIRED_FIELDS = [
  'content',
  'impact',
  'status',
  'topic',
]

const ALL_REQUIRED_FIELDS = [
  ...BASE_REQUIRED_FIELDS,
  'severity',
  'tag',
  'title',
]

const STATUSES = {
  ack: 'Acknowledged',
  fixed: 'Fixed',
  wontdo: 'Wont Do',
}

const ATTR_SEVERITIES = [
  'high',
  'medium',
  'low',
]

exports.severityNames = {
  'H': 'High',
  'M': 'Medium',
  'L': 'Low',
  'Q': 'Code Quality',
  'I': 'Informational',
  'G': 'Gas Optimization',

  'high': 'High',
  'medium': 'Medium',
  'low': 'Low',
}

exports.statusNames = STATUSES

exports.normalize = function normalizeIssue(issue) {
  validateBaseRequiredFields(issue, BASE_REQUIRED_FIELDS)

  const [firstLine, ...contentLines] = issue.content.split('\n')
  const [, tag, severity, title] = firstLine.match(/^## +\((([HMLQIG])-[0-9]+)\) +(.+)/)
  return {
    ...issue,
    title,
    tag,
    severity,
    content: contentLines.join('\n'),
    isVuln: ['H', 'M', 'L'].includes(severity),
  }
}

exports.validate = function validateIssue(issue) {
  validateBaseRequiredFields(issue, ALL_REQUIRED_FIELDS)

  let valid

  if (! (valid = Object.keys(STATUSES)).includes(issue.status)) {
    throw new Error(`Invalid issue status: '${issue.status}'. Valid options: ${valid.join(', ')}`)
  }
  if (! (valid = ATTR_SEVERITIES).includes(issue.impact)) {
    throw new Error(`Invalid issue impact: '${issue.impact}'. Valid options: ${valid.join(', ')}`)
  }
  if (issue.status === STATUSES.fixed && !issue.commit) {
    throw new Error(`Fixed issue missing 'commit' field`)
  }

  if (issue.isVuln && !issue.chance) {
    throw new Error(`'chance' field required for High, Medium, and Low severity issues`)
  }
  else if (!issue.isVuln && issue.chance) {
    throw new Error(`Do not use the 'chance' field for Code Quality or Gas Opt issues`)
  }
  if (issue.isVuln && !(valid = ATTR_SEVERITIES).includes(issue.chance)) {
    throw new Error(`Invalid issue chance: '${issue.chance}'. Valid options: ${valid.join(', ')}`)
  }
}

function validateBaseRequiredFields(issue, fields) {
  for(let field of fields) {
    if (! issue[field]) {
      throw new Error(`Issue missing required field: '${field}'`)
    }
  }
}
