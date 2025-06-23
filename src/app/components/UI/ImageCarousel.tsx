import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Modal, TouchableOpacity, Dimensions, TouchableWithoutFeedback, StyleProp, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFullImageUrl } from '../../utils/getFullImageUrl';
import colors from '../../styles/colors';

interface ImageCarouselProps {
  images: any[]; // Can be string URLs or image objects with a url/uri property
  title?: string;
  isCard?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, title, isCard = true, containerStyle }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const insets = useSafeAreaInsets();

  if (!images || images.length === 0) return null;

  const getImageUrl = (image: any): string => {
    if (typeof image === 'string') {
      return image;
    }
    return getFullImageUrl(image);
  }

  const openImage = (img: any) => {
    const imageUrl = getImageUrl(img);
    Image.getSize(imageUrl, (width, height) => {
      const screen = Dimensions.get('window');
      const maxWidth = screen.width * 0.95;
      const maxHeight = screen.height * 0.8;
      const aspectRatio = width / height;
      
      let newWidth = maxWidth;
      let newHeight = newWidth / aspectRatio;

      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
      }
      
      setImageSize({ width: newWidth, height: newHeight });
    });
    setSelectedImage(img);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
    setImageSize({ width: 0, height: 0 });
  };

  const screen = Dimensions.get('window');

  const content = (
    <>
      {title && <Text style={styles.title}>{title}</Text>}
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
            onPress={() => openImage(img)}
          >
            <Image
              source={{ uri: getImageUrl(img) }}
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
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={{ width: imageSize.width, height: imageSize.height }}>
                {selectedImage && (
                  <Image
                    source={{ uri: getImageUrl(selectedImage) }}
                    style={[styles.modalImage, { width: imageSize.width, height: imageSize.height }]}
                    resizeMode="contain"
                  />
                )}
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Feather name="x" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );

  return isCard ? (
    <View style={[styles.card, containerStyle]}>
      {content}
    </View>
  ) : (
    <View style={containerStyle}>
      {content}
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
    color: colors.darkGray,
    marginBottom: 15,
  },
  carousel: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  carouselContent: {
    paddingRight: 40,
  },
  imageCard: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 15,
    backgroundColor: colors.lightGray,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    borderRadius: 18,
  },
  closeButton: {
    position: 'absolute',
    top: -50,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
    zIndex: 1,
  },
});

export default ImageCarousel;
