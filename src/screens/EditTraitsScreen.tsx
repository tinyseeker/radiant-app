import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';

type EditTraitsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditTraits'>;
};

export default function EditTraitsScreen({ navigation }: EditTraitsScreenProps) {
  const { journal, updateJournal } = useJournal();
  const [traits, setTraits] = useState<string[]>(journal.traits);
  const [newTrait, setNewTrait] = useState('');

  const addTrait = () => {
    if (newTrait.trim()) {
      if (traits.length >= 10) {
        Alert.alert('Limit Reached', 'You can add up to 10 traits.');
        return;
      }
      setTraits([...traits, newTrait.trim()]);
      setNewTrait('');
    }
  };

  const removeTrait = (index: number) => {
    setTraits(traits.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await updateJournal({ traits });
      Alert.alert('Saved', 'Your traits have been saved.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save traits.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Traits</Text>
        <Text style={styles.description}>
          Define 5-10 key traits that describe the person you're becoming.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter a trait (e.g., Confident, Disciplined, Kind)..."
            value={newTrait}
            onChangeText={setNewTrait}
          />
          <TouchableOpacity style={styles.addButton} onPress={addTrait}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.countText}>{traits.length} / 10 traits</Text>

        <View style={styles.listContainer}>
          {traits.map((trait, index) => (
            <View key={index} style={styles.traitCard}>
              <Text style={styles.traitText}>{trait}</Text>
              <TouchableOpacity onPress={() => removeTrait(index)}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#7F8C8D',
    lineHeight: 22,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#2C3E50',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#8FBC8F',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  countText: {
    fontSize: 14,
    color: '#95A5A6',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 100,
  },
  traitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  traitText: {
    flex: 1,
    fontSize: 16,
    color: '#34495E',
  },
  removeText: {
    fontSize: 20,
    color: '#E74C3C',
    marginLeft: 12,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFF9F5',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  saveButton: {
    backgroundColor: '#FF9A76',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#FF9A76',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
