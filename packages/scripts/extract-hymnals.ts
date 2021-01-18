import * as fsp from 'fs'
const fs = fsp.promises
import * as cheerio from 'cheerio'
import { minify } from 'html-minifier'

const extract = async () => {
  const hymnals = await Promise.all(
    Array.from(Array(654).keys()).map(async (i) => {
      const index = (i + 1).toString().padStart(3, '0')

      const d = await fs.readFile(`./files/assets/f${index}.html`, 'utf8')

      const data = minify(d, {
        collapseWhitespace: true,
      }).replace(/<br>/gm, '\n')

      const $ = cheerio.load(data)

      const arr: string[] = $('tr')
        .map(function (i, el) {
          return $(this).text()
        })
        .get()

      const [title, ...content] = arr
      const hymnal = {
        id: index,
        title,
        content: content.reduce((arr, curr, i) => {
          const isTitle = i % 2 === 0
          if (isTitle) {
            arr.push({
              pos: curr,
              content: '',
            })
          } else {
            arr[arr.length - 1].content = curr
          }
          return arr
        }, [] as { pos: string; content: string }[]),
      }

      return hymnal
    })
  )

  console.log(hymnals)
  await fs.writeFile('hymnals.json', JSON.stringify(hymnals))
}

extract()
