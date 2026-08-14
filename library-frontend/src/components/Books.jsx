import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS } from '../queries'

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null)

  const booksByGenreResult = useQuery(ALL_BOOKS, {
    variables: { genre: selectedGenre },
    skip: !selectedGenre,
    fetchPolicy: 'cache-and-network',
  })

  if (!props.show) {
    return null
  }

  const allGenres = [...new Set((props.books || []).flatMap((b) => b.genres || []))]

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre)
    if (genre && booksByGenreResult.refetch) {
      booksByGenreResult.refetch({ genre })
    }
  }

  let displayedBooks = props.books || []
  if (selectedGenre) {
    if (booksByGenreResult.data?.allBooks) {
      displayedBooks = booksByGenreResult.data.allBooks
    } else {
      displayedBooks = (props.books || []).filter((b) => b.genres.includes(selectedGenre))
    }
  }

  return (
    <div>
      <h2>books</h2>
      {selectedGenre && (
        <p>
          in genre <strong>{selectedGenre}</strong>
        </p>
      )}

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {displayedBooks.map((a) => (
            <tr key={a.id || a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {allGenres.map((g) => (
          <button key={g} onClick={() => handleGenreClick(g)}>
            {g}
          </button>
        ))}
        <button onClick={() => handleGenreClick(null)}>all genres</button>
      </div>
    </div>
  )
}

export default Books
