// LANCER BUG:
//   For some reason, <include> doesn't work at this point.
//   Maybe something to do with including within a nested layout file.
// WORKAROUND:
//   Build HTML here and move this file to client/ folder so tailwind picks up tw classes

const endent = require('endent').default

module.exports = function renderFileHashesTemplate(content) {
  const fileHashes = endent(content)
    .split('\n')
    .filter(line => !!line) // Remove empty lines
    .map(line => {
      const parts = line.split(/\s+/)
      if (parts.length !== 2) {
        console.log("uh oh", parts)
        throw new Error(`[file-hashes] Invalid line: ${line}`)
      }
      return { file: parts[1], hash: parts[0] }
    })

  return `
    <table class="mt-8 table-fixed w-full divide-y divide-gray-300 dark:divide-gray-600 border-t border-b sm:border-r sm:border-l dark:border-gray-600 font-ui text-sm">
      <thead>
        <tr>
          <th
            scope="col"
            class="py-3.5 px-4 text-center font-medium text-gray-900 dark:text-gray-300 dark:text-gray-300"
          >
            Source Code
          </th>
          <th scope="col" class="py-3.5 px-4 text-center  font-medium text-gray-900 dark:text-gray-300">
            SHA256
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
        ${fileHashes.map(({ file, hash }) =>
            `
            <tr>
              <td class="w-1/2 p-4 font-medium text-gray-900 dark:text-gray-300 text-left break-words">
                ${file}
              </td>
              <td class="Copy w-1/2 p-4 dark:text-gray-100 font-ui text-left break-words break-all">
                <p class="!leading-none"><code>${hash}</code></p>
              </td>
            </tr>
            `
          )
          .join('\n')
        }
      </tbody>
    </table>
  `
}
