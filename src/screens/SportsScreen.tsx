import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";

import { api } from "@/server/api"
import { isAxiosError } from "axios"

type RootStackParamList = {
  Sports: undefined
  SportDetail: { sport: string }
}

const STORAGE_KEY = "@sports_list";

export default function SportsScreen() {
  useEffect(() => {
    AsyncStorage.clear();
  }, []);

  const [sports, setSports] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [newSport, setNewSport] = useState<string>("");

  useEffect(() => {
    loadSports();
  }, []);

  async function loadSports(): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);

    if (data) {
      setSports(JSON.parse(data) as string[]);
    } else {
      const response = await api.get("/getSports");

      const defaultSports = response.data.sports as string[];

      setSports(defaultSports);

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultSports)
      );
    }
  } catch (error) {
    console.log("Erro ao carregar esportes", error);
  }
}

  async function saveSports(list: string[]): Promise<void> {
    try {
      setSports(list);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (error) {
      console.log("Erro ao salvar esportes", error);
    }
  }

  async function addSport(): Promise<void> {
    if (!newSport.trim()) return;

    const updated = [...sports, newSport];
    await saveSports(updated);
    setNewSport("");
  }

  async function handleCreateSport() {
    try {
      const response = await api.post("/createSport", {
        sport: newSport,
      })

      addSport();

      Alert.alert(
        "Adicionar Esporte",
        `${response.data.sport} adicionado!`,
        [{ text: "Ok" }],
      );
    } catch (error) {
      if (isAxiosError(error)) {
        return Alert.alert(
          "Adicionar Esporte",
          error.response?.data,
          [{ text: "Ok" }],
        );
      }

      Alert.alert(
        "Adicionar Esporte",
        "Não foi possível adicionar. Tente novamente mais tarde.",
        [{ text: "Ok" }],
      );
    }
  }

  const filteredSports = sports.filter((sport) =>
    sport.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Esportes</Text>

      <TextInput
        style={styles.input}
        placeholder="Filtrar esporte..."
        placeholderTextColor="#FFFFFF"
        value={filter}
        onChangeText={setFilter}
      />

      <View style={styles.addContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Novo esporte"
          placeholderTextColor="#FFFFFF"
          value={newSport}
          onChangeText={setNewSport}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleCreateSport}>
          <Text style={styles.buttonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredSports}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.sportButton}
            onPress={() => router.push(`/sport/${item}`)}>
            <Text style={styles.buttonText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#000000",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#ED145B",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ED145B",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: "#ffffff",
    backgroundColor: "#1a1a1a",
  },

  addContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },

  addButton: {
    backgroundColor: "#ED145B",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
  },

  sportButton: {
    backgroundColor: "#ED145B",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
});