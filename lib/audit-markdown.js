import marked from 'marked'

export function renderIssueContent(source) {
  return marked.marked(source)
    .replace(/<aside>(.*?)<\/aside>/g, (_, body) => wrapAside(body))
}

export function renderInlineContent(source) {
  return marked.parseInline(source)
}

marked.use({
  gfm: true,
  renderer: {
    // heading(text, level) {
    //   const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    //   return `
    //           <h${level}>
    //             <a name="${escapedText}" class="anchor" href="#${escapedText}">
    //               <span class="header-link"></span>
    //             </a>
    //             ${text}
    //           </h${level}>`;
    // }
    // paragraph(text) {
    //   // Marked/gfm auto-links urls, so we have to "unwrap" the url in our regex
    //   const match = text.match(/^@embed <a href="(.*)">.*<\/a>$/)
    //   if (match) {
    //     return wrapEmbed(match[1])
    //   }
    //   return `<p>${text}</p>`
    // }
  }
})

function wrapInstructor(body) {
  return (
`<if cond="user && user.roles.includes('instructor')">
  <aside class="-instructor-notes" x-data="{ open: false }">
    <div class="cursor-pointer" @click="open = !open">Instructor Notes</div>
    <div x-cloak x-show="open" class="AsideContent">
      <!-- Heroicon name: academic-cap -->
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>
      <div>${body}</div>
    </div>
  </aside>
</if>
`
  )
}

function wrapAside(body) {
  return (
`<aside>
  <div class="AsideContent">
    <!-- Heroicon name: information-circle -->
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
    </svg>
    <div>${marked.parseInline(body)}</div>
  </div>
</aside>
`
  )
}

function wrapEmbed(url) {
  // https://www.youtube.com/embed/QILiHiTD3uc
  if (url.match('youtube.com')) {
    return (
      `<p><div class="yt-embed"><iframe src="https://www.youtube.com/embed/${getYoutubeId(url)}" frameborder="0" allowfullscreen></iframe></div></p>`
    )
  }
  else {
    return `Unknown video type: ${url}`
  }
}


// From https://www.npmjs.com/package/get-youtube-id
function getYoutubeId (url, opts) {
  if (/youtu\.?be/.test(url)) {

    // Look first for known patterns
    var i;
    var patterns = [
      /youtu\.be\/([^#\&\?]{11})/,  // youtu.be/<id>
      /\?v=([^#\&\?]{11})/,         // ?v=<id>
      /\&v=([^#\&\?]{11})/,         // &v=<id>
      /embed\/([^#\&\?]{11})/,      // embed/<id>
      /\/v\/([^#\&\?]{11})/         // /v/<id>
    ];

    // If any pattern matches, return the ID
    for (i = 0; i < patterns.length; ++i) {
      if (patterns[i].test(url)) {
        return patterns[i].exec(url)[1];
      }
    }

    // If that fails, break it apart by certain characters and look
    // for the 11 character key
    // var tokens = url.split(/[\/\&\?=#\.\s]/g);
    // for (i = 0; i < tokens.length; ++i) {
    //   if (/^[^#\&\?]{11}$/.test(tokens[i])) {
    //     return tokens[i];
    //   }
    // }
  }

  return null
}
