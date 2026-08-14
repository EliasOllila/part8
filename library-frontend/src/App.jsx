import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendation from './components/Recommendation'
import Notify from './components/Notify'
import { useApolloClient, useQuery } from '@apollo/client/react'
import { ALL_AUTHORS, ALL_BOOKS } from './queries'


const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem('user-token'),
  )
  const [page, setPage] = useState('authors')
  const authorsResult = useQuery(ALL_AUTHORS)
  const booksResult = useQuery(ALL_BOOKS)
  const [errorMessage, setErrorMessage] = useState(null)
  const client = useApolloClient()

  if (authorsResult.loading || booksResult.loading) {
    return <div>loading...</div>
  }

  const onLogout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('authors')
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }


  return (
    <div>
      <Notify errorMessage={errorMessage} />
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommend')}>recommend</button>
            <button onClick={onLogout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      <Authors show={page === 'authors'} props={authorsResult.data} token={token}/>

      <Books show={page === 'books'} books={booksResult.data?.allBooks || []} />

      <NewBook 
        show={page === 'add'} 
        setError={notify} 
        setPage={setPage} 
      />

      <LoginForm 
        show={page === 'login' && !token} 
        setToken={setToken} 
        setError={notify} 
        setPage={setPage} 
      />
      <Recommendation 
        show={page === 'recommend'}
        token={token}
      />
    </div>
  )
}

export default App
