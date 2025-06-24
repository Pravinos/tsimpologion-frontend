import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Modal, TouchableOpacity, Dimensions, TouchableWithoutFeedback, StyleProp, ViewStyle, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFullImageUrl } from '../../utils/getFullImageUrl';
import colors from '../../styles/colors';
import Animated, { FadeIn, FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [modalOverlayLayout, setModalOverlayLayout] = useState({ width: Dimensions.get('window').width, height: Dimensions.get('window').height });
  const modalFlatListRef = useRef<FlatList<any>>(null);
  const insets = useSafeAreaInsets();

  if (!images || images.length === 0) return null;

  const getImageUrl = (image: any): string => {
    if (typeof image === 'string') {
      return image;
    }
    return getFullImageUrl(image);
  }

  // Animation for image press
  const scaleValues = images.map(() => useSharedValue(1));

  const handlePressIn = (idx: number) => {
    scaleValues[idx].value = withSpring(0.95, { damping: 10 });
  };
  const handlePressOut = (idx: number) => {
    scaleValues[idx].value = withSpring(1, { damping: 10 });
  };

  const openImage = (img: any) => {
    const idx = images.findIndex(i => getImageUrl(i) === getImageUrl(img));
    setModalIndex(idx >= 0 ? idx : 0);
    setSelectedImage(img);
    setModalVisible(true);
    setImageLoaded(false);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
    setImageSize({ width: 0, height: 0 });
  };

  const onScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / 140); // 120 width + 15 marginRight + 5 fudge
    setActiveIndex(idx);
  };

  const handleModalScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / imageSize.width);
    setModalIndex(idx);
    setSelectedImage(images[idx]);
  };

  const screen = Dimensions.get('window');
  const modalMaxWidth = screen.width - 40; // 20px padding on each side
  const modalMaxHeight = screen.height - 80; // 40px padding top/bottom

  // Always scroll to correct index when modal opens or modalIndex/modalWidth changes
  useEffect(() => {
    if (modalVisible && modalFlatListRef.current && modalMaxWidth > 0) {
      setTimeout(() => {
        try {
          modalFlatListRef.current?.scrollToIndex({ index: modalIndex, animated: false });
        } catch (e) {}
      }, 30);
    }
  }, [modalVisible, modalIndex, modalMaxWidth]);

  const handleModalOverlayLayout = (e) => {
    setModalOverlayLayout({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
  };

  const content = (
    <>
      {title && <Text style={styles.title}>{title}</Text>}
      <Animated.ScrollView
        entering={FadeInUp.duration(500).damping(18)}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.carousel}
        contentContainerStyle={styles.carouselContent}
        snapToInterval={140}
        decelerationRate={0.92}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {images.map((img, idx) => {
          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scaleValues[idx].value }],
          }));
          return (
            <Animated.View
              key={idx}
              entering={FadeIn.duration(500).delay(idx * 60)}
              style={[{ borderRadius: 16 }, animatedStyle]}
            >
              <TouchableOpacity
                style={styles.imageCard}
                activeOpacity={0.85}
                onPress={() => openImage(img)}
                onPressIn={() => handlePressIn(idx)}
                onPressOut={() => handlePressOut(idx)}
              >
                <Image
                  source={{ uri: getImageUrl(img) }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
      {/* Modern indicator dots */}
      <View style={styles.dotsRow}>
        {images.map((_, idx) => (
          <View
            key={idx}
            style={[styles.dot, activeIndex === idx && styles.dotActive]}
          />
        ))}
      </View>
      {/* Modal for expanded image view */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay} onLayout={handleModalOverlayLayout}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: modalMaxWidth, height: modalMaxHeight, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', position: 'relative' }}>
              {/* X button: absolutely positioned at the top center, overlapping the image edge */}
              <TouchableOpacity
                style={[
                  styles.closeButtonModernFixed,
                  {
                    position: 'absolute',
                    marginLeft: -22, // half of button size (44)
                    zIndex: 20,
                    backgroundColor: colors.white,
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOpacity: 0.12,
                    shadowRadius: 4,
                    elevation: 2,
                    borderWidth: 1,
                    borderColor: colors.lightGray,
                  },
                ]}
                onPress={closeModal}
              >
                <Feather name="x" size={24} color={colors.darkGray} />
              </TouchableOpacity>
              <FlatList
                ref={modalFlatListRef}
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, idx) => idx.toString()}
                getItemLayout={(_, idx) => ({ length: modalMaxWidth, offset: modalMaxWidth * idx, index: idx })}
                onMomentumScrollEnd={handleModalScroll}
                renderItem={({ item }) => (
                  <View
                    style={{
                      width: modalMaxWidth,
                      height: modalMaxHeight,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 18,
                      overflow: 'hidden',
                      backgroundColor: 'transparent',
                    }}
                  >
                    <Image
                      source={{ uri: getImageUrl(item) }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                      onLoad={() => setImageLoaded(true)}
                    />
                  </View>
                )}
                extraData={imageLoaded}
              />
              {/* Modal indicator dots */}
              <View style={styles.dotsRowModal}>
                {images.map((_, idx) => (
                  <View
                    key={idx}
                    style={[styles.dot, modalIndex === idx && styles.dotActive]}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );

  return isCard ? (
    <Animated.View entering={FadeInUp.duration(500).damping(18)} style={[styles.card, containerStyle]}>
      {content}
    </Animated.View>
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
    padding: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 10,
  },
  carousel: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    height: 140,
  },
  carouselContent: {
    paddingRight: 32,
    alignItems: 'center',
  },
  imageCard: {
    width: 130,
    height: 130,
    borderRadius: 16,
    marginRight: 14,
    backgroundColor: colors.lightGray,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.lightGray,
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 18,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    alignSelf: 'center',
  },
  closeButtonModernFixed: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.white,
    padding: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  dotsRowModal: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 2,
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
});

export default ImageCarousel;
