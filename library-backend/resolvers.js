const Book = require('./models/book')
const Author = require('./models/author')

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
    
    allAuthors: async () => Author.find({})
  },
  
  Book: {
    author: async (root) => {
      return Author.findById(root.author)
    }
  },
  
  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author })

      if (!author) {
        author = new Author({ name: args.author })
        await author.save()
      }

      const book = new Book({ ...args, author: author._id })
      return book.save()
    },
    
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      
      if (!author) {
        return null
      }

      author.born = args.setBornTo
      return author.save()
    }
  }
}

module.exports = resolvers