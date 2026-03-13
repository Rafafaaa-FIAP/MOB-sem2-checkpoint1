import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/server/api"
import { isAxiosError } from "axios";

type Standing = {
  team: string;
  points: number;
};

type Match = {
  home: string;
  away: string;
  date: string;
  location: string;
};

type SportData = {
  standings: Standing[];
  matches: Match[];
};

export default function SportDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();

  const [data, setData] = useState<SportData>({
    standings: [],
    matches: [],
  });

  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [gameLocation, setGameLocation] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const stored = await AsyncStorage.getItem(`sport_${name}`);

    if (stored) {
      setData(JSON.parse(stored));
    } else {
      const defaultData: SportData = {
        standings: [
          { team: "3ESPR", points: 10 },
          { team: "2ESPS", points: 7 },
        ],
        matches: [],
      };

      setData(defaultData);

      await AsyncStorage.setItem(
        `sport_${name}`,
        JSON.stringify(defaultData)
      );
    }
  }

  async function handleCreateGame() {
    try {
      const response = await api.post("/createGame", {
        sport: name,
        home: homeTeam,
        away: awayTeam,
        date: gameDate,
        location: gameLocation,
      });

      const stored = await AsyncStorage.getItem(`sport_${name}`);

      let updatedData: SportData = {
        standings: [],
        matches: [],
      };

      if (stored) {
        updatedData = JSON.parse(stored);
      }

      const newMatch: Match = {
        home: response.data.home,
        away: response.data.away,
        date: response.data.date,
        location: response.data.location,
      };

      updatedData.matches.push(newMatch);

      await AsyncStorage.setItem(
        `sport_${name}`,
        JSON.stringify(updatedData)
      );

      setHomeTeam("");
      setAwayTeam("");
      setGameDate("");
      setGameLocation("");

      loadData();

      Alert.alert("Cadastrar jogo", "Jogo cadastrado com sucesso!", [
        { text: "Ok" },
      ]);
    } catch (error) {
      if (isAxiosError(error)) {
        return Alert.alert("Cadastrar jogo", error.response?.data, [
          { text: "Ok" },
        ]);
      }

      Alert.alert(
        "Cadastrar jogo",
        "Não foi possível cadastrar o jogo.",
        [{ text: "Ok" }]
      );
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{name}</Text>

      <Text style={styles.subtitle}>Classificação</Text>

      {data.standings.map((team, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.cell}>{team.team}</Text>
          <Text style={styles.cell}>{team.points} pts</Text>
        </View>
      ))}

      <Text style={styles.subtitle}>Próximos Jogos</Text>

      {data.matches.length === 0 && (
        <Text style={styles.emptyText}>Nenhum jogo cadastrado</Text>
      )}

      {data.matches.map((match, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.cell}>
            {match.home} vs {match.away}
          </Text>
          <Text style={styles.cell}>{match.date}</Text>
          <Text style={styles.cell}>{match.location}</Text>
        </View>
      ))}

      <Text style={styles.subtitle}>Cadastrar novo jogo</Text>

      <TextInput
        style={styles.input}
        placeholder="Time da casa"
        placeholderTextColor="#ffffff"
        value={homeTeam}
        onChangeText={setHomeTeam}
      />

      <TextInput
        style={styles.input}
        placeholder="Time visitante"
        placeholderTextColor="#ffffff"
        value={awayTeam}
        onChangeText={setAwayTeam}
      />

      <TextInput
        style={styles.input}
        placeholder="Data"
        placeholderTextColor="#ffffff"
        value={gameDate}
        onChangeText={setGameDate}
      />

      <TextInput
        style={styles.input}
        placeholder="Local"
        placeholderTextColor="#ffffff"
        value={gameLocation}
        onChangeText={setGameLocation}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleCreateGame}
      >
        <Text style={styles.buttonText}>Cadastrar jogo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ED145B",
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 18,
    color: "#ED145B",
    marginTop: 20,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ED145B",
    paddingVertical: 10,
  },

  cell: {
    color: "#ffffff",
    fontSize: 16,
  },

  emptyText: {
    color: "#ffffff",
    fontStyle: "italic",
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

  addButton: {
    backgroundColor: "#ED145B",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});