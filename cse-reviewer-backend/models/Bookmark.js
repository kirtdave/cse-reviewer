const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Bookmark = sequelize.define('Bookmark', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  note: { // Your frontend sends a note, so we store it here
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId', 'questionId'] // Prevents duplicate bookmarks
    }
  ]
});

// Associations defined in models/index.js usually, but good to know:
// Bookmark.belongsTo(User);
// Bookmark.belongsTo(Question);

module.exports = Bookmark;