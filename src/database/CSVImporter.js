import { chineseCharactersData } from '../data/chineseCharactersData';

export class CSVImporter {
  constructor(databaseHelper) {
    this.databaseHelper = databaseHelper;
  }

  async importFromAssets(csvFileName) {
    try {
      // Use the embedded data instead of trying to read from files
      return await this.importEmbeddedData();
    } catch (error) {
      console.error('Error importing embedded data:', error);
      throw error;
    }
  }

  async importEmbeddedData() {
    try {
      let importedCount = 0;

      for (const charData of chineseCharactersData) {
        try {
          // Prepare character object for insertion
          const characterObject = {
            character: charData.character,
            pinyin: charData.pinyin,
            englishTranslation: charData.englishTranslation,
            hebrewTranslation: charData.hebrewTranslation,
            sentenceLength: charData.relatedSentence ? charData.relatedSentence.length : 0,
            appearanceFrequency: charData.appearancesInSentences || 0
          };

          // Insert character
          const characterId = await this.databaseHelper.insertCharacter(characterObject);

          // Insert sentence if it exists
          if (charData.relatedSentence && charData.relatedSentence.trim()) {
            const sentenceObject = {
              characterId: characterId,
              sentence: charData.relatedSentence,
              sentencePinyin: charData.sentencePinyin,
              sentenceEnglishTranslation: charData.sentenceEnglishTranslation,
              sentenceHebrewTranslation: charData.sentenceHebrewTranslation
            };
            
            await this.databaseHelper.insertSentence(sentenceObject);
          }

          importedCount++;
        } catch (insertError) {
          console.error(`Error inserting character ${charData.character}:`, insertError);
        }
      }

      return importedCount;
    } catch (error) {
      console.error('Error importing embedded data:', error);
      throw error;
    }
  }

  async parseAndImportCSV(csvContent) {
    const lines = csvContent.split('\n');
    let importedCount = 0;

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        if (await this.importCSVLine(line)) {
          importedCount++;
        }
      } catch (error) {
        console.error(`Error importing line ${i}:`, error);
      }
    }

    return importedCount;
  }

  async importCSVLine(csvLine) {
    try {
      const fields = this.parseCSVLine(csvLine);

      if (fields.length < 11) {
        console.warn('Insufficient fields in CSV line:', csvLine);
        return false;
      }

      // Extract data from CSV fields
      // Expected format: line number,Character,Character pinyin,Character EN translation,Character HE translation,Related Sentence,Sentence Pinyin,Sentence EN Translation,Sentence HE Translation,Appearances in sentences,Group

      const character = this.cleanField(fields[1]);
      const pinyin = this.cleanField(fields[2]);
      const englishTranslation = this.cleanField(fields[3]);
      const hebrewTranslation = this.cleanField(fields[4]);
      const sentence = this.cleanField(fields[5]);
      const sentencePinyin = this.cleanField(fields[6]);
      const sentenceEnglishTranslation = this.cleanField(fields[7]);
      const sentenceHebrewTranslation = this.cleanField(fields[8]);

      // Parse numeric fields
      let appearanceFrequency = 0;
      try {
        appearanceFrequency = parseInt(this.cleanField(fields[9]), 10);
      } catch (error) {
        console.warn('Invalid appearance frequency:', fields[9]);
      }

      // Calculate sentence length
      const sentenceLength = sentence ? sentence.length : 0;

      // Create and insert character
      const characterId = await this.databaseHelper.insertCharacter({
        character,
        pinyin,
        englishTranslation,
        hebrewTranslation,
        sentenceLength,
        appearanceFrequency,
      });

      if (characterId > 0 && sentence && sentence.trim() !== '') {
        // Create and insert sentence
        await this.databaseHelper.insertSentence({
          characterId,
          sentence,
          sentencePinyin,
          sentenceEnglishTranslation,
          sentenceHebrewTranslation,
        });

        return true;
      }

      return characterId > 0;
    } catch (error) {
      console.error('Error importing CSV line:', csvLine, error);
      return false;
    }
  }

  parseCSVLine(csvLine) {
    const fields = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvLine.length; i++) {
      const c = csvLine.charAt(i);

      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += c;
      }
    }

    // Add the last field
    fields.push(currentField);

    return fields;
  }

  cleanField(field) {
    if (!field) {
      return '';
    }

    // Remove surrounding quotes if present
    if (field.startsWith('"') && field.endsWith('"')) {
      field = field.substring(1, field.length - 1);
    }

    // Replace escaped quotes
    field = field.replace(/""/g, '"');

    return field.trim();
  }

  async clearExistingData() {
    await this.databaseHelper.clearAllData();
  }
}
