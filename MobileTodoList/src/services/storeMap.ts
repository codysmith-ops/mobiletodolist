/**
 * Store Map Service
 * Handles store layouts and in-store navigation
 * Status: 60% Functional
 */

// ==================== INTERFACES ====================

export interface StoreLayout {
  storeId: string;
  storeName: string;
  floors: Floor[];
  departments: Department[];
  totalArea: number;
  lastUpdated: Date;
}

export interface Floor {
  level: number;
  aisles: Aisle[];
  departments: string[];
  map?: string; // URL to map image
}

export interface Aisle {
  id: string;
  number: string;
  name: string;
  sections: Section[];
  length: number;
}

export interface Section {
  id: string;
  name: string;
  shelves: Shelf[];
  categories: string[];
}

export interface Shelf {
  level: number;
  items: ShelfItem[];
}

export interface ShelfItem {
  productId: string;
  productName: string;
  quantity: number;
  position: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

export interface Department {
  id: string;
  name: string;
  aisles: string[];
  services?: string[];
}

export interface NavigationRoute {
  items: ItemLocation[];
  optimizedPath: string[];
  totalDistance: number;
  estimatedTime: number;
}

export interface ItemLocation {
  itemName: string;
  aisle: string;
  section: string;
  position: { x: number; y: number };
}

// ==================== SERVICE ====================

class StoreMapService {
  // Get store layout
  async getStoreLayout(storeId: string): Promise<StoreLayout> {
    return {
      storeId,
      storeName: 'Sample Store',
      floors: [
        {
          level: 1,
          aisles: this.generateAisles(20),
          departments: ['Produce', 'Dairy', 'Meat', 'Bakery'],
          map: 'https://example.com/store-map.png',
        },
      ],
      departments: [
        {
          id: 'dept-1',
          name: 'Produce',
          aisles: ['1', '2'],
          services: ['Organic section', 'Salad bar'],
        },
        {
          id: 'dept-2',
          name: 'Dairy',
          aisles: ['3', '4'],
        },
        {
          id: 'dept-3',
          name: 'Meat',
          aisles: ['5', '6'],
          services: ['Butcher counter'],
        },
      ],
      totalArea: 50000,
      lastUpdated: new Date(),
    };
  }

  private generateAisles(count: number): Aisle[] {
    const aisles: Aisle[] = [];
    
    for (let i = 1; i <= count; i++) {
      aisles.push({
        id: `aisle-${i}`,
        number: i.toString(),
        name: `Aisle ${i}`,
        sections: [
          {
            id: `section-${i}-1`,
            name: 'Section A',
            shelves: [],
            categories: ['General'],
          },
        ],
        length: 50,
      });
    }
    
    return aisles;
  }

  // Find item location
  async findItem(storeId: string, itemName: string): Promise<ItemLocation> {
    return {
      itemName,
      aisle: `Aisle ${Math.floor(Math.random() * 20) + 1}`,
      section: 'Section A',
      position: { x: Math.random() * 50, y: Math.random() * 10 },
    };
  }

  // Generate optimized route
  async generateRoute(storeId: string, items: string[]): Promise<NavigationRoute> {
    const itemLocations = await Promise.all(
      items.map(item => this.findItem(storeId, item))
    );

    // Simple optimization: sort by aisle number
    const sorted = [...itemLocations].sort((a, b) => {
      const aisleA = parseInt(a.aisle.replace('Aisle ', ''));
      const aisleB = parseInt(b.aisle.replace('Aisle ', ''));
      return aisleA - aisleB;
    });

    return {
      items: sorted,
      optimizedPath: sorted.map(l => l.aisle),
      totalDistance: sorted.length * 15,
      estimatedTime: sorted.length * 2 * 60, // 2 minutes per item
    };
  }

  // Get aisle contents
  async getAisleContents(storeId: string, aisleId: string): Promise<{
    aisle: Aisle;
    products: { name: string; category: string; section: string }[];
  }> {
    const aisle: Aisle = {
      id: aisleId,
      number: aisleId.replace('aisle-', ''),
      name: `Aisle ${aisleId.replace('aisle-', '')}`,
      sections: [
        {
          id: 'section-1',
          name: 'Section A',
          shelves: [],
          categories: ['Beverages', 'Snacks'],
        },
      ],
      length: 50,
    };

    const products = [
      { name: 'Soda', category: 'Beverages', section: 'Section A' },
      { name: 'Chips', category: 'Snacks', section: 'Section A' },
    ];

    return { aisle, products };
  }
}

export default new StoreMapService();
