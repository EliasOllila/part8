import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, ME } from '../queries'

const Recommendation = ({show}) => {

    const meResult = useQuery(ME)

    const userFavoriteGenre = meResult.data?.me?.favoriteGenre

    const booksResult = useQuery(ALL_BOOKS, {
        variables: { genre: userFavoriteGenre },
        skip: !userFavoriteGenre
    })

    if (!show) {
        return null
    }

    const books = booksResult.data?.allBooks || []

    return (
        <div>
        <h2>recommendations</h2>
        <p>
            books in your favorite genre <strong>{userFavoriteGenre}</strong>
        </p>

        <table>
            <tbody>
            <tr>
                <th></th>
                <th>author</th>
                <th>published</th>
            </tr>
            {books.map((b) => (
                <tr key={b.title}>
                <td>{b.title}</td>
                <td>{b.author.name}</td>
                <td>{b.published}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    )
}

export default Recommendation