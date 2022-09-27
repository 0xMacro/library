import { parseNotionMarkdownIssues, notionIssueToLancerCollectionItem } from '../../lib/issues'

function parseInput() {
  output.value = parseNotionMarkdownIssues(input.value).map(notionIssueToLancerCollectionItem).join('\n\n') + '\n'
}

input.addEventListener('input', parseInput)
parseInput()
