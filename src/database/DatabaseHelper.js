import SQLite from 'react-native-sqlite-storage';

// Enable promise-based API
SQLite.enablePromise(true);

export class DatabaseHelper {
  constructor() {
    this.db = null;
    this.dbName = 'chinese_learning.db';
  }

  async initializeDatabase() {
    try {
      this.db = await SQLite.openDatabase({
        name: this.dbName,
        location: 'default',
      });

      await this.createTables();
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    const createCharactersTable = `
      CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character TEXT NOT NULL,
        pinyin TEXT NOT NULL,
        english_translation TEXT NOT NULL,
        hebrew_translation TEXT NOT NULL,
        sentence_length INTEGER NOT NULL,
        appearance_frequency INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createSentencesTable = `
      CREATE TABLE IF NOT EXISTS sentences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id INTEGER NOT NULL,
        sentence TEXT NOT NULL,
        sentence_pinyin TEXT NOT NULL,
        sentence_english_translation TEXT NOT NULL,
        sentence_hebrew_translation TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (character_id) REFERENCES characters (id)
      )
    `;

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        viewed_count INTEGER DEFAULT 0,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createUserProgressTable = `
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        character_id INTEGER NOT NULL,
        viewed BOOLEAN DEFAULT FALSE,
        completed BOOLEAN DEFAULT FALSE,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        times_practiced INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (character_id) REFERENCES characters (id)
      )
    `;

    await this.db.executeSql(createCharactersTable);
    await this.db.executeSql(createSentencesTable);
    await this.db.executeSql(createUsersTable);
    await this.db.executeSql(createUserProgressTable);

    // Check and add missing columns to existing tables (only for existing databases)
    await this.checkAndAddMissingColumns();

    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_characters_frequency ON characters(appearance_frequency DESC)',
      'CREATE INDEX IF NOT EXISTS idx_characters_length ON characters(sentence_length)',
      'CREATE INDEX IF NOT EXISTS idx_sentences_character_id ON sentences(character_id)',
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
      'CREATE INDEX IF NOT EXISTS idx_user_progress_user_character ON user_progress(user_id, character_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_progress_viewed ON user_progress(user_id, viewed)',
    ];

    for (const index of createIndexes) {
      try {
        await this.db.executeSql(index);
      } catch (error) {
        if (error.message.includes('no such column: viewed')) {
          // Skipping viewed column index - column will be added by migration
        } else {
          console.warn('Index creation failed (may already exist):', error.message);
        }
      }
    }
  }

  async checkAndAddMissingColumns() {
    try {
      
      // Check if 'viewed' column exists in user_progress table
      const result = await this.db.executeSql("PRAGMA table_info(user_progress)");
      
      // Handle array result structure
      let actualResult = result;
      if (Array.isArray(result) && result.length > 0) {
        actualResult = result[0];
      }
      
      // Check if result and rows exist
      if (!actualResult || !actualResult.rows) {
        return;
      }

      const columns = [];
      for (let i = 0; i < actualResult.rows.length; i++) {
        columns.push(actualResult.rows.item(i).name);
      }


      // Add 'viewed' column if it doesn't exist
      if (!columns.includes('viewed')) {
        await this.db.executeSql('ALTER TABLE user_progress ADD COLUMN viewed BOOLEAN DEFAULT FALSE');
      } else {
      }

      // Add 'completed' column if it doesn't exist
      if (!columns.includes('completed')) {
        await this.db.executeSql('ALTER TABLE user_progress ADD COLUMN completed BOOLEAN DEFAULT FALSE');
      } else {
      }

      // Add 'times_practiced' column if it doesn't exist
      if (!columns.includes('times_practiced')) {
        await this.db.executeSql('ALTER TABLE user_progress ADD COLUMN times_practiced INTEGER DEFAULT 0');
      } else {
      }

      // Check if 'viewed_count' column exists in users table
      const usersResult = await this.db.executeSql("PRAGMA table_info(users)");
      
      // Handle array result structure
      let actualUsersResult = usersResult;
      if (Array.isArray(usersResult) && usersResult.length > 0) {
        actualUsersResult = usersResult[0];
      }
      
      if (actualUsersResult && actualUsersResult.rows) {
        const usersColumns = [];
        for (let i = 0; i < actualUsersResult.rows.length; i++) {
          usersColumns.push(actualUsersResult.rows.item(i).name);
        }
        // Add 'viewed_count' column if it doesn't exist
        if (!usersColumns.includes('viewed_count')) {
          await this.db.executeSql('ALTER TABLE users ADD COLUMN viewed_count INTEGER DEFAULT 0');
        }

        // Add 'is_admin' column if it doesn't exist
        if (!usersColumns.includes('is_admin')) {
          await this.db.executeSql('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE');
        }
      }

      // Create the viewed column index if it was missing
      if (!columns.includes('viewed')) {
        try {
          await this.db.executeSql('CREATE INDEX IF NOT EXISTS idx_user_progress_viewed ON user_progress(user_id, viewed)');
        } catch (indexError) {
          console.warn('Failed to create viewed column index:', indexError.message);
        }
      }

    } catch (error) {
      console.warn('Error checking/adding missing columns:', error.message);
    }
  }

  async insertCharacter(character) {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO characters (character, pinyin, english_translation, hebrew_translation, sentence_length, appearance_frequency)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await this.db.executeSql(query, [
      character.character,
      character.pinyin,
      character.englishTranslation,
      character.hebrewTranslation,
      character.sentenceLength,
      character.appearanceFrequency,
    ]);

    return result[0].insertId;
  }

  async insertSentence(sentence) {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO sentences (character_id, sentence, sentence_pinyin, sentence_english_translation, sentence_hebrew_translation)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await this.db.executeSql(query, [
      sentence.characterId,
      sentence.sentence,
      sentence.sentencePinyin,
      sentence.sentenceEnglishTranslation,
      sentence.sentenceHebrewTranslation,
    ]);

    return result[0].insertId;
  }

  async getCharacter(id) {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'SELECT * FROM characters WHERE id = ?';
    const result = await this.db.executeSql(query, [id]);

    if (result[0].rows.length > 0) {
      const row = result[0].rows.item(0);
      return {
        id: row.id,
        character: row.character,
        pinyin: row.pinyin,
        englishTranslation: row.english_translation,
        hebrewTranslation: row.hebrew_translation,
        sentenceLength: row.sentence_length,
        appearanceFrequency: row.appearance_frequency,
      };
    }

    return null;
  }

  async getAllCharacters() {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'SELECT * FROM characters ORDER BY appearance_frequency DESC';
    const result = await this.db.executeSql(query);

    const characters = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      characters.push({
        id: row.id,
        character: row.character,
        pinyin: row.pinyin,
        englishTranslation: row.english_translation,
        hebrewTranslation: row.hebrew_translation,
        sentenceLength: row.sentence_length,
        appearanceFrequency: row.appearance_frequency,
      });
    }

    return characters;
  }

  async getSentenceByCharacterId(characterId) {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'SELECT * FROM sentences WHERE character_id = ? LIMIT 1';
    const result = await this.db.executeSql(query, [characterId]);

    if (result[0].rows.length > 0) {
      const row = result[0].rows.item(0);
      return {
        id: row.id,
        characterId: row.character_id,
        sentence: row.sentence,
        sentencePinyin: row.sentence_pinyin,
        sentenceEnglishTranslation: row.sentence_english_translation,
        sentenceHebrewTranslation: row.sentence_hebrew_translation,
      };
    }

    return null;
  }

  async getAllSentences() {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'SELECT * FROM sentences ORDER BY id';
    const result = await this.db.executeSql(query);

    const sentences = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      sentences.push({
        id: row.id,
        characterId: row.character_id,
        sentence: row.sentence,
        sentencePinyin: row.sentence_pinyin,
        sentenceEnglishTranslation: row.sentence_english_translation,
        sentenceHebrewTranslation: row.sentence_hebrew_translation,
      });
    }

    return sentences;
  }

  async getCharacterCount() {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'SELECT COUNT(*) as count FROM characters';
    const result = await this.db.executeSql(query);

    return result[0].rows.item(0).count;
  }

  // User Progress Methods
  async updateUserProgress(userId, characterId, completed = false) {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT OR REPLACE INTO user_progress (user_id, character_id, completed, last_accessed, times_practiced)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, 
        COALESCE((SELECT times_practiced FROM user_progress WHERE user_id = ? AND character_id = ?), 0) + 1)
    `;

    await this.db.executeSql(query, [userId, characterId, completed, userId, characterId]);
  }

  async getUserProgress(userId, characterId) {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'SELECT * FROM user_progress WHERE user_id = ? AND character_id = ?';
    const result = await this.db.executeSql(query, [userId, characterId]);

    if (result[0].rows.length > 0) {
      const row = result[0].rows.item(0);
      return {
        id: row.id,
        userId: row.user_id,
        characterId: row.character_id,
        completed: row.completed === 1,
        lastAccessed: row.last_accessed,
        timesPracticed: row.times_practiced,
      };
    }

    return null;
  }

  async getCompletedCharacters(userId) {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      SELECT character_id FROM user_progress 
      WHERE user_id = ? AND completed = 1
    `;
    const result = await this.db.executeSql(query, [userId]);

    const completedCharacters = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      completedCharacters.push(result[0].rows.item(i).character_id);
    }

    return completedCharacters;
  }

  async getUserProgressSummary(userId) {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      SELECT 
        COUNT(*) as total_characters,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_characters,
        SUM(times_practiced) as total_practices
      FROM user_progress 
      WHERE user_id = ?
    `;
    const result = await this.db.executeSql(query, [userId]);

    if (result[0].rows.length > 0) {
      const row = result[0].rows.item(0);
      return {
        totalCharacters: row.total_characters,
        completedCharacters: row.completed_characters,
        totalPractices: row.total_practices,
      };
    }

    return { totalCharacters: 0, completedCharacters: 0, totalPractices: 0 };
  }

  async clearAllData() {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql('DELETE FROM user_progress');
    await this.db.executeSql('DELETE FROM sentences');
    await this.db.executeSql('DELETE FROM characters');
  }

  // User Management Methods
  async createUser(username, password) {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = `
      INSERT INTO users (username, password, created_at, last_login)
      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    const result = await this.db.executeSql(query, [username, password]);
    return result.insertId;
  }

  async getUserByUsername(username) {
    if (!this.db) {
      console.error('Database not initialized!');
      throw new Error('Database not initialized');
    }
    
    // First, let's check if there are any users in the database
    try {
      const allUsersQuery = 'SELECT * FROM users';
      const allUsersResult = await this.db.executeSql(allUsersQuery, []);
      
      // Handle array result structure
      let actualAllUsersResult = allUsersResult;
      if (Array.isArray(allUsersResult) && allUsersResult.length > 0) {
        actualAllUsersResult = allUsersResult[0];
      }
    } catch (error) {
      console.error('Error checking all users:', error);
    }
    
    const query = 'SELECT * FROM users WHERE username = ?';
    try {
      const result = await this.db.executeSql(query, [username]);
      
      // Handle different SQLite result structures
      let actualResult = result;
      
      // If result is an array, get the first element
      if (Array.isArray(result) && result.length > 0) {
        actualResult = result[0];
      }
      
      let rows = null;
      if (actualResult && actualResult.rows) {
        rows = actualResult.rows;
      } else if (actualResult && Array.isArray(actualResult)) {
        rows = actualResult;
      } else if (actualResult && actualResult._array) {
        rows = actualResult._array;
      }
      
      if (rows && rows.length > 0) {
        const user = rows.item ? rows.item(0) : rows[0];
        
        // Validate that we have actual user data, not the result object
        if (user && user.id && user.username) {
          return user;
        } else {
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      return null;
    }
  }

  async updateUserLastLogin(userId) {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
    await this.db.executeSql(query, [userId]);
  }

  async markCharacterAsViewed(userId, characterId) {
    if (!this.db) throw new Error('Database not initialized');
    
    // Check if progress record exists
    const checkQuery = 'SELECT * FROM user_progress WHERE user_id = ? AND character_id = ?';
    const checkResult = await this.db.executeSql(checkQuery, [userId, characterId]);
    
    // Handle array result structure
    let actualCheckResult = checkResult;
    if (Array.isArray(checkResult) && checkResult.length > 0) {
      actualCheckResult = checkResult[0];
    }
    
    const recordCount = actualCheckResult && actualCheckResult.rows ? actualCheckResult.rows.length : 0;
    
    let isNewView = false;
    
    if (recordCount > 0) {
      // Update existing record
      const updateQuery = `
        UPDATE user_progress 
        SET viewed = TRUE, last_accessed = CURRENT_TIMESTAMP, times_practiced = times_practiced + 1
        WHERE user_id = ? AND character_id = ?
      `;
      await this.db.executeSql(updateQuery, [userId, characterId]);
    } else {
      // Create new record
      const insertQuery = `
        INSERT INTO user_progress (user_id, character_id, viewed, last_accessed, times_practiced)
        VALUES (?, ?, TRUE, CURRENT_TIMESTAMP, 1)
      `;
      await this.db.executeSql(insertQuery, [userId, characterId]);
      isNewView = true;
    }
    
    // Update user's viewed character count if this is a new view
    if (isNewView) {
      await this.updateUserViewedCount(userId);
    }
    
    return isNewView;
  }

  async updateUserViewedCount(userId) {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      // Get current count of viewed characters
      const countQuery = 'SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND viewed = TRUE';
      const countResult = await this.db.executeSql(countQuery, [userId]);
      
      // Handle different SQLite result structures
      let actualResult = countResult;
      if (Array.isArray(countResult) && countResult.length > 0) {
        actualResult = countResult[0];
      }
      
      const viewedCount = actualResult && actualResult.rows ? actualResult.rows.item(0).count : 0;
      
      // Update user record with the new count
      const updateQuery = 'UPDATE users SET viewed_count = ? WHERE id = ?';
      await this.db.executeSql(updateQuery, [viewedCount, userId]);
      
      return viewedCount;
    } catch (error) {
      console.error('Error updating user viewed count:', error);
      return 0;
    }
  }

  async clearUserProgress(userId) {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      // Clear all user progress records
      const deleteQuery = 'DELETE FROM user_progress WHERE user_id = ?';
      await this.db.executeSql(deleteQuery, [userId]);
      
      // Reset user's viewed count to 0
      const updateQuery = 'UPDATE users SET viewed_count = 0 WHERE id = ?';
      await this.db.executeSql(updateQuery, [userId]);
      
      return true;
    } catch (error) {
      console.error('Error clearing user progress:', error);
      return false;
    }
  }

  async setUserAsAdmin(username) {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const updateQuery = 'UPDATE users SET is_admin = TRUE WHERE username = ?';
      const result = await this.db.executeSql(updateQuery, [username]);
      
      // Handle array result structure
      let actualResult = result;
      if (Array.isArray(result) && result.length > 0) {
        actualResult = result[0];
      }
      
      if (actualResult && actualResult.rowsAffected > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error setting user as admin:', error);
      return false;
    }
  }


  async getViewedCharacters(userId) {
    
    if (!this.db) throw new Error('Database not initialized');
    
    const query = `
      SELECT character_id, last_accessed, times_practiced
      FROM user_progress 
      WHERE user_id = ? AND viewed = TRUE
      ORDER BY last_accessed DESC
    `;
    
    const result = await this.db.executeSql(query, [userId]);
    
    // Handle array result structure
    let actualResult = result;
    if (Array.isArray(result) && result.length > 0) {
      actualResult = result[0];
    }
    
    const viewedCharacters = [];
    
    if (actualResult && actualResult.rows) {
      for (let i = 0; i < actualResult.rows.length; i++) {
        const row = actualResult.rows.item(i);
        viewedCharacters.push(row);
      }
    }
    
    return viewedCharacters;
  }

  async getViewedCharacterCount(userId) {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = 'SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND viewed = TRUE';
    const result = await this.db.executeSql(query, [userId]);
    
    return result.rows.item(0).count;
  }

  async getUserViewedCount(userId) {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const query = 'SELECT viewed_count FROM users WHERE id = ?';
      const result = await this.db.executeSql(query, [userId]);
      
      // Handle array result structure
      let actualResult = result;
      if (Array.isArray(result) && result.length > 0) {
        actualResult = result[0];
      }
      
      if (actualResult && actualResult.rows && actualResult.rows.length > 0) {
        const viewedCount = actualResult.rows.item(0).viewed_count;
        return viewedCount;
      } else {
        return 0;
      }
    } catch (error) {
      console.error('Error getting user viewed count:', error);
      return 0;
    }
  }

  async getUserProgressSummary(userId) {
    if (!this.db) throw new Error('Database not initialized');
    
    const totalCharacters = await this.getCharacterCount();
    const viewedCount = await this.getViewedCharacterCount(userId);
    const completionPercentage = totalCharacters > 0 ? Math.round((viewedCount / totalCharacters) * 100) : 0;
    
    return {
      totalCharacters,
      viewedCharacters: viewedCount,
      completionPercentage
    };
  }

  async testUserRegistration(username) {
    console.log('Testing username:', username);
    
    if (!this.db) {
      console.error('Database not initialized!');
      return false;
    }
    
    try {
      // Test 1: Check if user exists in users table
      const userQuery = 'SELECT * FROM users WHERE username = ?';
      const userResult = await this.db.executeSql(userQuery, [username]);
      
      // Handle array result structure
      let actualUserResult = userResult;
      if (Array.isArray(userResult) && userResult.length > 0) {
        actualUserResult = userResult[0];
      }
      
      if (actualUserResult && actualUserResult.rows && actualUserResult.rows.length > 0) {
        const user = actualUserResult.rows.item(0);
        console.log('✅ User found in database:', user);
        
        // Test 2: Check user_progress table structure
        const progressQuery = 'SELECT * FROM user_progress WHERE user_id = ? LIMIT 1';
        const progressResult = await this.db.executeSql(progressQuery, [user.id]);
        
        // Handle array result structure
        let actualProgressResult = progressResult;
        if (Array.isArray(progressResult) && progressResult.length > 0) {
          actualProgressResult = progressResult[0];
        }
        
        console.log('✅ User progress table accessible');
        console.log('Progress records for user:', actualProgressResult && actualProgressResult.rows ? actualProgressResult.rows.length : 0);
        
        // Test 3: Check table schemas
        const userTableInfo = await this.db.executeSql("PRAGMA table_info(users)");
        const progressTableInfo = await this.db.executeSql("PRAGMA table_info(user_progress)");
        
        // Handle array results
        let actualUserTableInfo = userTableInfo;
        if (Array.isArray(userTableInfo) && userTableInfo.length > 0) {
          actualUserTableInfo = userTableInfo[0];
        }
        
        let actualProgressTableInfo = progressTableInfo;
        if (Array.isArray(progressTableInfo) && progressTableInfo.length > 0) {
          actualProgressTableInfo = progressTableInfo[0];
        }
        
        console.log('✅ Users table columns:');
        if (actualUserTableInfo && actualUserTableInfo.rows) {
          for (let i = 0; i < actualUserTableInfo.rows.length; i++) {
            const column = actualUserTableInfo.rows.item(i);
            console.log(`  - ${column.name} (${column.type})`);
          }
        }
        
        console.log('✅ User_progress table columns:');
        if (actualProgressTableInfo && actualProgressTableInfo.rows) {
          for (let i = 0; i < actualProgressTableInfo.rows.length; i++) {
            const column = actualProgressTableInfo.rows.item(i);
            console.log(`  - ${column.name} (${column.type})`);
          }
        }
        
        return true;
      } else {
        console.log('❌ User not found in database');
        return false;
      }
    } catch (error) {
      console.error('❌ Error testing user registration:', error);
      return false;
    }
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  async deleteDatabase() {
    try {
      console.log('Deleting database file...');
      if (this.db) {
        await this.db.close();
        this.db = null;
      }
      
      // Delete the database file
      const SQLite = require('react-native-sqlite-storage').default;
      await SQLite.deleteDatabase({ name: this.dbName });
      console.log('Database file deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting database:', error);
      return false;
    }
  }

  // Add a test user for development/testing
  async addTestUser() {
    try {
      // Check if test user already exists
      const existingUser = await this.getUserByUsername('testuser');
      if (existingUser) {
        console.log('Test user already exists:', existingUser);
        return existingUser.id;
      }

      // Create test user
      const testUserId = await this.createUser('testuser', '1234');
      console.log('Test user created with ID:', testUserId);
      
      // Add some test progress data
      await this.markCharacterAsViewed(testUserId, 1);
      await this.markCharacterAsViewed(testUserId, 2);
      await this.markCharacterAsViewed(testUserId, 3);
      console.log('Test user progress data added');
      
      return testUserId;
    } catch (error) {
      console.error('Error adding test user:', error);
      return null;
    }
  }

  // Get all users with their progress
  async getAllUsersWithProgress() {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = `
      SELECT 
        u.id,
        u.username,
        u.created_at,
        u.last_login,
        COUNT(DISTINCT up.character_id) as viewed_characters,
        COUNT(DISTINCT c.id) as total_characters,
        ROUND((COUNT(DISTINCT up.character_id) * 100.0 / COUNT(DISTINCT c.id)), 2) as completion_percentage
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id AND up.viewed = 1
      LEFT JOIN characters c ON 1=1
      GROUP BY u.id, u.username, u.created_at, u.last_login
      ORDER BY u.created_at DESC
    `;
    
    const result = await this.db.executeSql(query);
    const users = [];
    
    // Handle SQLite result format (result is an array with the actual result at index 0)
    const actualResult = result[0];
    
    for (let i = 0; i < actualResult.rows.length; i++) {
      users.push(actualResult.rows.item(i));
    }
    
    return users;
  }
}
