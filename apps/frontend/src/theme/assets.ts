import type { ImageSourcePropType } from 'react-native';

export type IconName = 'water' | 'dry' | 'soil' | 'diversify' | 'maize' | 'bean' | 'sorghum' | 'rain' | 'sun' | 'location';

export const icons: Record<IconName, ImageSourcePropType> = {
  water: require('../../assets/icons/water.png'),
  dry: require('../../assets/icons/dry.png'),
  soil: require('../../assets/icons/soil.png'),
  diversify: require('../../assets/icons/diversify.png'),
  maize: require('../../assets/icons/maize.png'),
  bean: require('../../assets/icons/bean.png'),
  sorghum: require('../../assets/icons/sorghum.png'),
  rain: require('../../assets/icons/rain.png'),
  sun: require('../../assets/icons/sun.png'),
  location: require('../../assets/icons/location.png'),
};

export const images = {
  logo: require('../../assets/brand/yago-logo.png') as ImageSourcePropType,
  symbol: require('../../assets/brand/yago-symbol.png') as ImageSourcePropType,
  grain: require('../../assets/art/grain.png') as ImageSourcePropType,
  grainLight: require('../../assets/art/grain-light.png') as ImageSourcePropType,
  haloMaize: require('../../assets/art/halo-maize.webp') as ImageSourcePropType,
  haloLeaf: require('../../assets/art/halo-leaf.webp') as ImageSourcePropType,
  eyelid: require('../../assets/art/eyelid.png') as ImageSourcePropType,
};
