
import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { getFullImageUrl } from '../utils/getFullImageUrl';
import colors from '../styles/colors';

interface ReviewImagesCarouselProps {
  images: string[];
}

const ReviewImagesCarousel: React.FC<ReviewImagesCarouselProps> = ({ images }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  if (!images || images.length === 0) return null;

  const openImage = (img: string) => {
    setSelectedImage(img);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const screen = Dimensions.get('window');

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Community Photos</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.carousel}
        contentContainerStyle={styles.carouselContent}
      >
        {images.map((img, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.imageCard}
            activeOpacity={0.85}
            onPress={() => openImage(img as string)}
          >
            <Image
              source={{ uri: typeof img === 'string' ? img : getFullImageUrl(img) }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal for expanded image view */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeModal}>
          <View style={styles.modalContent}>
            {selectedImage && (
              <Image
                source={{ uri: typeof selectedImage === 'string' ? selectedImage : getFullImageUrl(selectedImage) }}
                style={{
                  width: screen.width * 0.95,
                  height: screen.height * 0.6,
                  borderRadius: 18,
                  resizeMode: 'contain',
                  backgroundColor: '#000',
                }}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    marginHorizontal: 13,
    marginBottom: 18,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  carousel: {
    paddingVertical: 6,
  },
  carouselContent: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  imageCard: {
    width: 170,
    height: 130,
    borderRadius: 18,
    marginRight: 16,
    backgroundColor: '#f4f4f4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  // Removed overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    marginTop: 18,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ReviewImagesCarousel;
