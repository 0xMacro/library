
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
  'H': 'High',
  'M': 'Medium',
  'L': 'Low',
  'Q': 'Code Quality',
  'I': 'Informational',
  'G': 'Gas Optimization',

  'high': 'High',
  'medium': 'Medium',
  'low': 'Low',
  'spec': 'Spec Breaking',
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
    throw new Error(`Invalid issue status: '${issue.status}'. Valid options: ${valid.join(', ')} (for issue: ${estimateIssuePreview(issue)})`)
  }
  if (! (valid = IMPACT_SEVERITIES).includes(issue.impact)) {
    throw new Error(`Invalid issue impact: '${issue.impact}'. Valid options: ${valid.join(', ')} (for issue: ${estimateIssuePreview(issue)})`)
  }
  // Will uncomment once we have the commit hash for the one that's currently missing
  // if (issue.status === 'fixed' && !issue.commit) {
  //   throw new Error(`Fixed issue missing 'commit' field (for issue: ${estimateIssuePreview(issue)})`)
  // }
  /*else*/ if (issue.commit && issue.status !== 'fixed' && issue.status !== 'addressed') {
    throw new Error(`Do not provide a 'commit' field when issue is not 'fixed' or 'addressed' (for issue: ${estimateIssuePreview(issue)})`)
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
