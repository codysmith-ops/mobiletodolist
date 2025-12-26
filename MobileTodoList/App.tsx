import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {getDistance} from 'geolib';
import {launchCamera} from 'react-native-image-picker';
import MlkitOcr from 'react-native-mlkit-ocr';
import {useTodoStore, NavPreference, Task} from './src/store';
import {palette, radius, shadow, spacing} from './src/theme';
import {useVoiceInput} from './src/hooks/useVoiceInput';
import {searchStores, StoreResult} from './src/services/storeSearch';

const SPEED_MPS = 9; // roughly 32 km/h city driving

const App = (): React.JSX.Element => {
  const {
    tasks,
    addTask,
    toggleComplete,
    removeTask,
    setNavPreference,
    navPreference,
  } = useTodoStore();

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [productBrand, setProductBrand] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [routePlan, setRoutePlan] = useState<Task[]>([]);
  const [routeMessage, setRouteMessage] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<
    | {
        latitude: number;
        longitude: number;
      }
    | null
  >(null);
  const [locationStatus, setLocationStatus] = useState<string>('Detecting location...');
  const [storeResults, setStoreResults] = useState<StoreResult[]>([]);
  const [isSearchingStores, setIsSearchingStores] = useState(false);
  const alertedRef = useRef<Record<string, number>>({});

  const {
    isListening,
    transcript,
    error: voiceError,
    start,
    stop,
    reset,
  } = useVoiceInput();

  useEffect(() => {
    if (transcript) {
      setTitle(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization?.();
    }
    
    // Get initial position immediately
    Geolocation.getCurrentPosition(
      position => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCurrentPosition(coords);
        setLocationStatus(`📍 ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      },
      error => {
        setLocationStatus(`⚠️ Location unavailable: ${error.message}`);
      },
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 0},
    );

    // Continue watching for updates
    const watchId = Geolocation.watchPosition(
      position => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCurrentPosition(coords);
        setLocationStatus(`📍 ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      },
      error => {
        setLocationStatus(`⚠️ Location error: ${error.message}`);
      },
      {enableHighAccuracy: true, distanceFilter: 50, timeout: 10000},
    );

    return () => {
      if (watchId != null) {
        Geolocation.clearWatch?.(watchId);
      }
    };
  }, []);

  useEffect(() => {
    if (!currentPosition) {
      return;
    }
    const now = Date.now();
    tasks.forEach(task => {
      if (!task.latitude || !task.longitude || task.completed) {
        return;
      }
      const meters = getDistance(
        {
          latitude: currentPosition.latitude,
          longitude: currentPosition.longitude,
        },
        {latitude: task.latitude, longitude: task.longitude},
      );
      const etaMinutes = Math.max(1, Math.round(meters / SPEED_MPS / 60));
      if (etaMinutes <= 10 && etaMinutes >= 5) {
        const last = alertedRef.current[task.id];
        if (!last || now - last > 10 * 60 * 1000) {
          alertedRef.current[task.id] = now;
          Alert.alert(
            'Nearby reminder',
            `${task.title} is about ${etaMinutes} minutes away.`,
            [
              {text: 'Ignore', style: 'cancel'},
              {text: 'Confirm', onPress: () => openNavigation(task, navPreference)},
            ],
          );
        }
      }
    });
  }, [tasks, currentPosition, navPreference]);

  const pendingCount = useMemo(
    () => tasks.filter(task => !task.completed).length,
    [tasks],
  );

  const handleAdd = useCallback(() => {
    if (!title.trim()) {
      return;
    }
    const latNum = latitude ? Number(latitude) : undefined;
    const lngNum = longitude ? Number(longitude) : undefined;

    addTask({
      title: title.trim(),
      note: note.trim() || undefined,
      locationLabel: locationLabel.trim() || undefined,
      latitude: Number.isFinite(latNum) ? latNum : undefined,
      longitude: Number.isFinite(lngNum) ? lngNum : undefined,
      imageUri,
      productBrand: productBrand.trim() || undefined,
      productDetails: productDetails.trim() || undefined,
    });

    setTitle('');
    setNote('');
    setLocationLabel('');
    setLatitude('');
    setLongitude('');
    setImageUri(undefined);
    setProductBrand('');
    setProductDetails('');
    reset();
  }, [
    title,
    note,
    latitude,
    longitude,
    locationLabel,
    imageUri,
    productBrand,
    productDetails,
    addTask,
    reset,
  ]);

  const handleVoiceToggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  const useCurrentLocation = useCallback(() => {
    if (currentPosition) {
      setLatitude(currentPosition.latitude.toString());
      setLongitude(currentPosition.longitude.toString());
      Alert.alert('Location added', 'Current position set for this task');
    } else {
      Alert.alert('Location unavailable', 'Waiting for GPS signal...');
    }
  }, [currentPosition]);

  const takePhoto = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission denied', 'Camera permission is required');
          return;
        }
      }

      const result = await launchCamera({
        mediaType: 'photo',
        saveToPhotos: false,
        quality: 0.8,
      });

      if (result.didCancel || !result.assets?.[0]?.uri) {
        return;
      }

      const photoUri = result.assets[0].uri;
      setImageUri(photoUri);

      // Perform text recognition
      const recognitionResult = await MlkitOcr.detectFromUri(photoUri);
      
      // Extract brand and product details
      const allText = recognitionResult.map(block => block.text).join(' ');
      
      // Simple heuristic: first line is often the brand
      const lines = recognitionResult.map(block => block.text);
      if (lines.length > 0) {
        setProductBrand(lines[0]);
        setProductDetails(allText);
        
        // Auto-search stores when product is detected
        handleStoreSearch(lines[0], allText);
      }
    } catch (error) {
      console.error('Camera/OCR error:', error);
      Alert.alert('Error', 'Failed to process image');
    }
  }, []);

  const handleStoreSearch = useCallback(async (brand?: string, details?: string) => {
    const searchTerm = title || brand || details;
    if (!searchTerm?.trim()) {
      Alert.alert('Search required', 'Please enter a product name or take a photo');
      return;
    }

    setIsSearchingStores(true);
    try {
      const results = await searchStores({
        productBrand: productBrand || brand,
        productDetails: productDetails || details,
        searchTerm: searchTerm.trim(),
        userLocation: currentPosition || undefined,
      });
      setStoreResults(results);
      
      if (results.length === 0) {
        Alert.alert('No results', 'No stores found for this product');
      }
    } catch (error) {
      console.error('Store search error:', error);
      Alert.alert('Search failed', 'Could not search stores at this time');
    } finally {
      setIsSearchingStores(false);
    }
  }, [title, productBrand, productDetails, currentPosition]);

  const clearImage = useCallback(() => {
    setImageUri(undefined);
    setProductBrand('');
    setProductDetails('');
    setStoreResults([]);
  }, []);

  const optimizeRoute = useCallback(() => {
    if (!currentPosition) {
      setRoutePlan([]);
      setRouteMessage('Need current location to plan a route.');
      return;
    }

    const remaining = tasks.filter(
      task =>
        !task.completed &&
        typeof task.latitude === 'number' &&
        typeof task.longitude === 'number',
    );

    if (!remaining.length) {
      setRoutePlan([]);
      setRouteMessage('Add lat/lng on tasks to plan a route.');
      return;
    }

    const ordered: Task[] = [];
    let cursor = {
      latitude: currentPosition.latitude,
      longitude: currentPosition.longitude,
    };

    while (remaining.length) {
      let bestIndex = 0;
      let bestDistance = Number.MAX_SAFE_INTEGER;

      remaining.forEach((task, idx) => {
        const distance = getDistance(cursor, {
          latitude: task.latitude!,
          longitude: task.longitude!,
        });
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = idx;
        }
      });

      const [next] = remaining.splice(bestIndex, 1);
      ordered.push(next);
      cursor = {latitude: next.latitude!, longitude: next.longitude!};
    }

    setRoutePlan(ordered);
    setRouteMessage(`Optimized ${ordered.length} stop${ordered.length === 1 ? '' : 's'}.`);
  }, [currentPosition, tasks]);

  const renderTask = useCallback(
    ({item}: {item: Task}) => (
      <TaskCard
        task={item}
        onToggle={() => toggleComplete(item.id)}
        onDelete={() => removeTask(item.id)}
        onNavigate={() => openNavigation(item, navPreference)}
      />
    ),
    [navPreference, removeTask, toggleComplete],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={palette.primary} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.hero}>
          <Text style={styles.title}>Mobile Todo</Text>
          <Text style={styles.subtitle}>
            Voice-first, location-aware reminders in Deadstock Zero indigo.
          </Text>
          <Text style={styles.locationStatus}>{locationStatus}</Text>
          <View style={styles.heroRow}>
            <Metric label="Pending" value={pendingCount} />
            <Metric label="Completed" value={tasks.length - pendingCount} />
            <Metric label="Nearby" value="5-10 min" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add item</Text>
          {imageUri && (
            <View style={styles.imagePreview}>
              <Image source={{uri: imageUri}} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImage}
                onPress={() => {
                  setImageUri(undefined);
                  setProductBrand('');
                  setProductDetails('');
                }}>
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <TextInput
            placeholder="What do you need?"
            placeholderTextColor={palette.muted}
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            placeholder="Notes (optional)"
            placeholderTextColor={palette.muted}
            value={note}
            onChangeText={setNote}
            style={styles.input}
          />
          {productBrand ? (
            <TextInput
              placeholder="Product brand"
              placeholderTextColor={palette.muted}
              value={productBrand}
              onChangeText={setProductBrand}
              style={styles.input}
            />
          ) : null}
          {productDetails ? (
            <TextInput
              placeholder="Product details"
              placeholderTextColor={palette.muted}
              value={productDetails}
              onChangeText={setProductDetails}
              style={styles.input}
              multiline
            />
          ) : null}
          <TextInput
            placeholder="Location label (store, service)"
            placeholderTextColor={palette.muted}
            value={locationLabel}
            onChangeText={setLocationLabel}
            style={styles.input}
          />
          <View style={styles.row}>
            <TextInput
              placeholder="Lat"
              placeholderTextColor={palette.muted}
              value={latitude}
              onChangeText={setLatitude}
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Lng"
              placeholderTextColor={palette.muted}
              value={longitude}
              onChangeText={setLongitude}
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
            />
          </View>
          <GhostButton
            label="📍 Use current location"
            onPress={useCurrentLocation}
          />
          <GhostButton
            label="📸 Take photo"
            onPress={takePhoto}
          />
          <GhostButton
            label={isSearchingStores ? "Searching stores..." : "🔍 Search stores"}
            onPress={() => handleStoreSearch()}
            disabled={isSearchingStores}
          />

          <View style={styles.row}>
            <PrimaryButton label="Add" onPress={handleAdd} />
            <GhostButton
              label={isListening ? 'Stop voice' : 'Voice add'}
              onPress={handleVoiceToggle}
            />
          </View>
          {voiceError ? <Text style={styles.errorText}>{voiceError}</Text> : null}
        </View>

        {storeResults.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Store Availability</Text>
            <Text style={styles.helperText}>
              {storeResults.length} store{storeResults.length === 1 ? '' : 's'} found
              {currentPosition ? ' - sorted by distance' : ''}
            </Text>
            <View style={styles.storeList}>
              {storeResults.map((result, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.storeCard}
                  onPress={() => result.url && Linking.openURL(result.url)}>
                  <View style={styles.storeHeader}>
                    <View style={styles.storeNameRow}>
                      <Text style={styles.storeLogo}>{result.storeLogo}</Text>
                      <Text style={styles.storeName}>{result.store}</Text>
                    </View>
                    <View style={[
                      styles.availabilityBadge,
                      result.inStock ? styles.inStockBadge : styles.outOfStockBadge
                    ]}>
                      <Text style={styles.availabilityText}>{result.availability}</Text>
                    </View>
                  </View>
                  <Text style={styles.productName} numberOfLines={1}>
                    {result.productName}
                  </Text>
                  {result.price && (
                    <Text style={styles.price}>${result.price.toFixed(2)}</Text>
                  )}
                  {result.storeLocation && (
                    <View style={styles.storeLocationInfo}>
                      <Text style={styles.storeLocationName} numberOfLines={1}>
                        📍 {result.storeLocation.name}
                      </Text>
                      <Text style={styles.storeAddress} numberOfLines={1}>
                        {result.storeLocation.address}
                      </Text>
                      {result.storeLocation.distance !== undefined && (
                        <Text style={styles.distance}>
                          {result.storeLocation.distance < 1
                            ? `${(result.storeLocation.distance * 1000).toFixed(0)}m away`
                            : `${result.storeLocation.distance.toFixed(1)}km away`}
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Navigation preference</Text>
          <View style={styles.navRow}>
            <Chip
              label="Apple Maps"
              active={navPreference === 'apple'}
              onPress={() => setNavPreference('apple')}
            />
            <Chip
              label="Google Maps"
              active={navPreference === 'google'}
              onPress={() => setNavPreference('google')}
            />
            <Chip
              label="Waze"
              active={navPreference === 'waze'}
              onPress={() => setNavPreference('waze')}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.routeHeader}>
            <Text style={styles.cardTitle}>Route for today</Text>
            <GhostButton label="Plan route" onPress={optimizeRoute} />
          </View>
          {routeMessage ? (
            <Text style={styles.helperText}>{routeMessage}</Text>
          ) : null}
          {routePlan.length ? (
            <View style={styles.routeList}>
              {routePlan.map((task, idx) => (
                <RouteStep
                  key={task.id}
                  index={idx}
                  task={task}
                  previous={idx === 0 ? currentPosition : routePlan[idx - 1]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your list</Text>
          <FlatList
            data={tasks}
            keyExtractor={item => item.id}
            renderItem={renderTask}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Add text or use voice to capture a todo.
              </Text>
            }
            scrollEnabled={false}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Metric = ({label, value}: {label: string; value: string | number}) => (
  <View style={styles.metric}>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const PrimaryButton = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.primaryButton} onPress={onPress}>
    <Text style={styles.primaryButtonText}>{label}</Text>
  </TouchableOpacity>
);

const GhostButton = ({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <TouchableOpacity 
    style={[styles.ghostButton, disabled && styles.ghostButtonDisabled]} 
    onPress={onPress}
    disabled={disabled}>
    <Text style={[styles.ghostButtonText, disabled && styles.ghostButtonTextDisabled]}>{label}</Text>
  </TouchableOpacity>
);

const Chip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const TaskCard = ({
  task,
  onToggle,
  onDelete,
  onNavigate,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onNavigate: () => void;
}) => {
  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={[styles.taskTitle, task.completed && styles.completed]}>
          {task.title}
        </Text>
        <View style={styles.badgeRow}>
          {task.locationLabel ? (
            <Text style={styles.badge}>{task.locationLabel}</Text>
          ) : null}
          {task.latitude && task.longitude ? (
            <Text style={styles.badge}>GPS saved</Text>
          ) : null}
        </View>
      </View>
      {task.note ? <Text style={styles.taskNote}>{task.note}</Text> : null}
      <View style={styles.taskActions}>
        <Chip
          label={task.completed ? 'Completed' : 'Mark done'}
          active={task.completed}
          onPress={onToggle}
        />
        <GhostButton label="Navigate" onPress={onNavigate} />
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const formatDistance = (meters: number) => {
  if (!Number.isFinite(meters)) {
    return '';
  }
  const km = meters / 1000;
  if (km >= 10) {
    return `${Math.round(km)} km`;
  }
  return `${km.toFixed(1)} km`;
};

const RouteStep = ({
  index,
  task,
  previous,
}: {
  index: number;
  task: Task;
  previous: {latitude: number; longitude: number} | Task | null | undefined;
}) => {
  const hasPrev = previous && 'latitude' in previous && 'longitude' in previous;
  const legMeters = hasPrev
    ? getDistance(
        {latitude: (previous as any).latitude, longitude: (previous as any).longitude},
        {latitude: task.latitude!, longitude: task.longitude!},
      )
    : undefined;

  return (
    <View style={styles.routeStep}>
      <View style={styles.routeBadge}>
        <Text style={styles.routeBadgeText}>{index + 1}</Text>
      </View>
      <View style={styles.routeContent}>
        <Text style={styles.routeTitle}>{task.title}</Text>
        <Text style={styles.routeMeta}>
          {task.locationLabel ?? 'No label'}
          {legMeters !== undefined ? ` • ${formatDistance(legMeters)} from previous` : ''}
        </Text>
      </View>
    </View>
  );
};

const openNavigation = (task: Task, preference: NavPreference) => {
  const hasCoords = task.latitude && task.longitude;
  const coordsQuery = hasCoords
    ? `${task.latitude},${task.longitude}`
    : undefined;
  const label = encodeURIComponent(task.locationLabel ?? task.title);

  let url = '';

  if (preference === 'google') {
    url = coordsQuery
      ? `comgooglemaps://?daddr=${coordsQuery}&directionsmode=driving`
      : `comgooglemaps://?q=${label}`;
  } else if (preference === 'waze') {
    url = coordsQuery
      ? `waze://?ll=${coordsQuery}&navigate=yes`
      : `waze://?q=${label}`;
  } else {
    url = coordsQuery
      ? `http://maps.apple.com/?daddr=${coordsQuery}`
      : `http://maps.apple.com/?q=${label}`;
  }

  Linking.openURL(url).catch(() => {
    const fallback = coordsQuery
      ? `https://www.google.com/maps/dir/?api=1&destination=${coordsQuery}`
      : `https://www.google.com/maps/search/?api=1&query=${label}`;
    Linking.openURL(fallback);
  });
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
  },
  flex: {
    flex: 1,
  },
  hero: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: '#EEF2FF',
    fontSize: 15,
    lineHeight: 22,
  },
  locationStatus: {
    color: '#C7D2FE',
    fontSize: 13,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  heroRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  metric: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: spacing.md,
    borderRadius: radius.md,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  metricLabel: {
    color: '#E0E7FF',
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: palette.surface,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderColor: palette.border,
    borderWidth: 1,
    ...shadow.card,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    marginBottom: spacing.md,
  },
  imagePreview: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    resizeMode: 'cover',
  },
  removeImage: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: palette.text,
    marginBottom: spacing.sm,
  },
  halfInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: palette.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ghostButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderColor: palette.primary,
    borderWidth: 1,
    alignItems: 'center',
  },
  ghostButtonText: {
    color: palette.primary,
    fontWeight: '700',
  },
  ghostButtonDisabled: {
    opacity: 0.5,
  },
  ghostButtonTextDisabled: {
    color: palette.muted,
  },
  navRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    borderColor: palette.border,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  chipText: {
    color: palette.text,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  routeList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  routeBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  routeContent: {
    flex: 1,
  },
  routeTitle: {
    color: palette.text,
    fontWeight: '700',
  },
  routeMeta: {
    color: palette.muted,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: spacing.sm,
  },
  emptyText: {
    color: palette.muted,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  taskCard: {
    borderRadius: radius.md,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.md,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  badge: {
    backgroundColor: palette.primaryLight,
    color: '#FFFFFF',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '700',
  },
  taskNote: {
    color: palette.muted,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  deleteButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderColor: '#DC2626',
    borderWidth: 1,
  },
  deleteText: {
    color: '#DC2626',
    fontWeight: '700',
  },
  completed: {
    textDecorationLine: 'line-through',
    color: palette.muted,
  },
  errorText: {
    color: '#DC2626',
    marginTop: spacing.xs,
  },
  helperText: {
    color: palette.muted,
    marginTop: spacing.xs,
  },
  storeList: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  storeCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  storeLogo: {
    fontSize: 24,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
  },
  availabilityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  inStockBadge: {
    backgroundColor: '#10B981',
  },
  outOfStockBadge: {
    backgroundColor: '#DC2626',
  },
  availabilityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  productName: {
    fontSize: 14,
    color: palette.text,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: spacing.xs,
  },
  storeLocationInfo: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  storeLocationName: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text,
    marginBottom: 2,
  },
  storeAddress: {
    fontSize: 12,
    color: palette.muted,
    marginBottom: 2,
  },
  distance: {
    fontSize: 12,
    color: palette.primary,
    fontWeight: '600',
  },
});

export default App;
