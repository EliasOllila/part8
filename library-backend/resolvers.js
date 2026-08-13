const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    
    allBooks: async (root, args) => {
      if (args.genre) {
        return Book.find({ genres: { $in: [args.genre] } })
      }
      return Book.find({})
    },
    
    allAuthors: async () => Author.find({}),
    
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  
  Book: {
    author: async (root) => {
      return Author.findById(root.author)
    }
  },
  
  Mutation: {
    addBook: async (root, args, context) => {
      // 1. Authentication Check
      if (!context.currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      let author = await Author.findOne({ name: args.author })

      if (!author) {
        author = new Author({ name: args.author })
        try {
          await author.save()
        } catch (error) {
          throw new GraphQLError(`Saving author failed: ${error.message}`, {
            extensions: { code: 'BAD_USER_INPUT', error }
          })
        }
      }

      const book = new Book({ ...args, author: author._id })
      
      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError(`Saving book failed: ${error.message}`, {
          extensions: { code: 'BAD_USER_INPUT', error }
        })
      }

      return book
    },
    
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      const author = await Author.findOne({ name: args.name })
      
      if (!author) {
        return null
      }

      author.born = args.setBornTo
      
      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError(`Saving author failed: ${error.message}`, {
          extensions: { code: 'BAD_USER_INPUT', error }
        })
      }
      
      return author
    },

    createUser: async (root, args) => {
      const user = new User({ 
        username: args.username, 
        favoriteGenre: args.favoriteGenre 
      })

      try {
        await user.save()
      } catch (error) {
        throw new GraphQLError(`Creating user failed: ${error.message}`, {
          extensions: { code: 'BAD_USER_INPUT', error }
        })
      }
      return user
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      // Hardcoded password validation
      if (!user || args.password !== 'secret') {
        throw new GraphQLError('Wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },

     _resetDatabase: async () => {
      if (process.env.NODE_ENV !== 'test') {
        throw new GraphQLError('_resetDatabase is only available in test mode')
      }
      await Author.deleteMany({})
      await Book.deleteMany({})
      await User.deleteMany({})
      return true
    },
  }
}

module.exports = resolvers