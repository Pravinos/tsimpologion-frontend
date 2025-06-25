import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Modal, TouchableOpacity, Dimensions, StyleProp, ViewStyle, FlatList } from 'react-native';
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

interface CarouselImageItemProps {
  image: any;
  index: number;
  onPress: (image: any) => void;
  getImageUrl: (image: any) => string;
}

const CarouselImageItem: React.FC<CarouselImageItemProps> = ({ image, index, onPress, getImageUrl }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 10 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 10 });
  }, []);

  return (
    <Animated.View
      entering={FadeIn.duration(500).delay(index * 60)}
      style={[{ borderRadius: 16 }, animatedStyle]}
    >
      <TouchableOpacity
        style={styles.imageCard}
        activeOpacity={0.85}
        onPress={() => onPress(image)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Image
          source={{ uri: getImageUrl(image) }}
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images: imagesProp, 
  title, 
  isCard = true, 
  containerStyle 
}) => {
  // Ensure images is never undefined
  const images = useMemo(() => imagesProp || [], [imagesProp]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [modalOverlayLayout, setModalOverlayLayout] = useState({ 
    width: Dimensions.get('window').width, 
    height: Dimensions.get('window').height 
  });
  
  const modalFlatListRef = useRef<FlatList<any>>(null);
  const insets = useSafeAreaInsets();

  // Get screen dimensions for modal sizing
  const screen = Dimensions.get('window');
  const modalMaxWidth = screen.width - 40; // 20px padding on each side
  const modalMaxHeight = screen.height - 80; // 40px padding top/bottom

  // Function to get image URL
  const getImageUrl = useCallback((image: any): string => {
    if (typeof image === 'string') {
      return image;
    }
    return getFullImageUrl(image);
  }, []);

  // Open image
  const openImage = useCallback((img: any) => {
    const idx = images.findIndex(i => getImageUrl(i) === getImageUrl(img));
    setModalIndex(idx >= 0 ? idx : 0);
    setSelectedImage(img);
    setModalVisible(true);
    setImageLoaded(false);
  }, [images, getImageUrl]);

  // Close modal
  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedImage(null);
    setImageSize({ width: 0, height: 0 });
  }, []);

  // Handle scroll
  const onScroll = useCallback((e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / 140); // 120 width + 15 marginRight + 5 fudge
    setActiveIndex(idx);
  }, []);

  // Handle modal scroll
  const handleModalScroll = useCallback((e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / modalOverlayLayout.width);
    setModalIndex(idx);
    if (images[idx]) {
      setSelectedImage(images[idx]);
    }
  }, [images, modalOverlayLayout.width]);

  // Handle modal overlay layout
  const handleModalOverlayLayout = useCallback((e: any) => {
    setModalOverlayLayout({ 
      width: e.nativeEvent.layout.width, 
      height: e.nativeEvent.layout.height 
    });
  }, []);

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

  // Return null if no images
  if (images.length === 0) return null;

  // Render carousel dots
  const renderDots = (currentIndex: number) => (
    <View style={styles.dotsRow}>
      {images.map((_, idx) => (
        <View
          key={idx}
          style={[styles.dot, currentIndex === idx && styles.dotActive]}
        />
      ))}
    </View>
  );

  // Render modal content
  const renderModal = () => (
    <Modal
      visible={modalVisible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay} onLayout={handleModalOverlayLayout}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ 
            width: modalMaxWidth, 
            height: modalMaxHeight, 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: 'transparent', 
            position: 'relative' 
          }}>
            {/* X button */}
            <TouchableOpacity
              style={[
                styles.closeButtonModernFixed,
                {
                  position: 'absolute',
                  marginLeft: -22, 
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
            
            {/* Image gallery */}
            <FlatList
              ref={modalFlatListRef}
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, idx) => idx.toString()}
              getItemLayout={(_, idx) => ({ 
                length: modalMaxWidth, 
                offset: modalMaxWidth * idx, 
                index: idx 
              })}
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
  );

  // Main content of the component
  const content = (
    <>
      {title && <Text style={styles.title}>{title}</Text>}
      <Animated.FlatList
        entering={FadeInUp.duration(500).damping(18)}
        data={images}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.carousel}
        contentContainerStyle={styles.carouselContent}
        snapToInterval={140}
        decelerationRate={0.92}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <CarouselImageItem 
            image={item} 
            index={index} 
            onPress={openImage}
            getImageUrl={getImageUrl}
          />
        )}
        keyExtractor={(_, idx) => `carousel-item-${idx}`}
      />
      {renderDots(activeIndex)}
      {renderModal()}
    </>
  );

  // Return the component with appropriate wrapper
  return isCard ? (
    <Animated.View 
      entering={FadeInUp.duration(500).damping(18)} 
      style={[styles.card, containerStyle]}
    >
      {content}
    </Animated.View>
  ) : (
    <View style={containerStyle}>
      {content}
    </View>
  );
};

export default ImageCarousel;
