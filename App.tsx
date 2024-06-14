import { Camera } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Platform, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from './src/services/api';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      }
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await uploadImage(result.assets[0].uri); // Espera o upload antes de continuar
    }
  };

  const uploadImage = async (uri: string) => {
    const formData = new FormData();
    formData.append('photo', {
      uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Resposta da API:', response.data); // Exibe a resposta da API
    } catch (error) {
      console.error('Erro ao enviar imagem:', error); // Exibe erro, se houver
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await uploadImage(result.assets[0].uri); // Espera o upload antes de continuar
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Teste Pellis</Text>
      <Button title="Escolher da Galeria" onPress={pickImage} />
      <Button title="Tirar Foto" onPress={takePhoto} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    top: -300,
    fontSize: 30,
  },
});
