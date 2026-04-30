const API_URL = "http://127.0.0.1:8000";

export interface ShipmentLocation {
  latitude: number;
  longitude: number;
}

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  current_location: ShipmentLocation;
  eta: string;
  status: string;
}

export interface RiskResponse {
  shipment_id: string;
  risk_score: number;
  risk_level: string;
  reason: string;
}

export interface PredictionResponse {
  shipment_id: string;
  predicted_delay_minutes: number;
  confidence: number;
  reason: string;
}

export interface RecommendationResponse {
  shipment_id: string;
  action: string;
  reason: string;
  impact: string;
}

export interface ShipmentCreate {
  origin: string;
  destination: string;
  current_location: ShipmentLocation;
  eta: string;
  status?: string;
}

let MOCK_MODE = true;

const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: "SHIP-1001",
    origin: "San Francisco",
    destination: "Tokyo",
    current_location: { latitude: 37.7749, longitude: -122.4194 },
    eta: new Date(Date.now() + 172800000).toISOString(),
    status: "in_transit"
  },
  {
    id: "SHIP-1002",
    origin: "London",
    destination: "Berlin",
    current_location: { latitude: 51.5074, longitude: -0.1278 },
    eta: new Date(Date.now() + 86400000).toISOString(),
    status: "delayed"
  }
];

export const api = {
  async getShipments(): Promise<Shipment[]> {
    try {
      const res = await fetch(`${API_URL}/shipments`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      MOCK_MODE = false;
      return res.json();
    } catch (e) {
      MOCK_MODE = true;
      console.warn("Backend unreachable. Entering Mock Mode.");
      return MOCK_SHIPMENTS;
    }
  },

  async createShipment(data: ShipmentCreate): Promise<Shipment> {
    if (MOCK_MODE) {
      const newShip: Shipment = { 
        ...data, 
        id: `MOCK-${Math.floor(Math.random()*1000)}`,
        status: data.status || "pending"
      };
      MOCK_SHIPMENTS.push(newShip);
      return newShip;
    }
    const res = await fetch(`${API_URL}/shipments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create shipment");
    return res.json();
  },

  async getRisk(id: string): Promise<RiskResponse> {
    if (MOCK_MODE) {
      const reasons = [
        "Unusual dwell time detected at major terminal hub.",
        "Geopolitical volatility in transit corridor.",
        "Severe weather front approaching destination port.",
        "Predictive sensor anomaly on asset telemetry.",
        "Historical delay patterns correlate with current trajectory."
      ];
      return { 
        shipment_id: id, 
        risk_score: Math.floor(Math.random() * 90), 
        risk_level: Math.random() > 0.7 ? "high" : "medium", 
        reason: reasons[Math.floor(Math.random() * reasons.length)] 
      };
    }
    const res = await fetch(`${API_URL}/shipments/${id}/risk`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch risk");
    return res.json();
  },

  async getPrediction(id: string): Promise<PredictionResponse> {
    if (MOCK_MODE) {
      const reasons = [
        "Congestion at Suez Canal causing ripple delays.",
        "Machine Learning model predicts 14% chance of reroute.",
        "Satellite data shows traffic buildup in Sector 4.",
        "Fuel efficiency optimization suggesting speed reduction."
      ];
      return { 
        shipment_id: id, 
        predicted_delay_minutes: Math.floor(Math.random() * 120), 
        confidence: 0.85 + Math.random() * 0.1, 
        reason: reasons[Math.floor(Math.random() * reasons.length)] 
      };
    }
    const res = await fetch(`${API_URL}/shipments/${id}/prediction`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch prediction");
    return res.json();
  },

  async getRecommendation(id: string): Promise<RecommendationResponse> {
    if (MOCK_MODE) {
      const actions: any[] = ["reroute", "reschedule", "no_action"];
      const reasons = [
        "Avoid high-congestion zone identified by AI core.",
        "Optimize carbon footprint by switching to rail freight.",
        "Maintain current course - minimal risk detected.",
        "Priority bypass available for high-value cargo."
      ];
      const selectedAction = actions[Math.floor(Math.random() * actions.length)];
      return { 
        shipment_id: id, 
        action: selectedAction, 
        reason: reasons[Math.floor(Math.random() * reasons.length)], 
        impact: selectedAction === "reroute" ? "Reduces fuel consumption by 14%" : "Maintains 98% reliability score" 
      };
    }
    const res = await fetch(`${API_URL}/shipments/${id}/recommendation`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch recommendation");
    return res.json();
  },

  async deleteShipment(id: string): Promise<void> {
    if (MOCK_MODE) {
      const idx = MOCK_SHIPMENTS.findIndex(s => s.id === id);
      if (idx > -1) MOCK_SHIPMENTS.splice(idx, 1);
      return;
    }
    const res = await fetch(`${API_URL}/shipments/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete shipment");
  },

  async simulate(): Promise<any> {
    if (MOCK_MODE) {
      MOCK_SHIPMENTS.forEach(s => {
        if (s.status !== "delivered") {
          s.current_location.latitude += (Math.random() - 0.5) * 0.1;
          s.current_location.longitude += (Math.random() - 0.5) * 0.1;
        }
      });
      return { status: "success", mode: "mock" };
    }
    const res = await fetch(`${API_URL}/shipments/simulate`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to run simulation");
    return res.json();
  },

  async bulkGenerate(count: number = 10): Promise<any> {
    if (MOCK_MODE) {
      for (let i = 0; i < count; i++) {
        MOCK_SHIPMENTS.push({
          id: `MOCK-${Math.floor(Math.random()*10000)}`,
          origin: "Origin City",
          destination: "Target Port",
          current_location: { latitude: Math.random() * 180 - 90, longitude: Math.random() * 360 - 180 },
          eta: new Date(Date.now() + Math.random() * 1000000000).toISOString(),
          status: "in_transit"
        });
      }
      return { status: "success", mode: "mock" };
    }
    const res = await fetch(`${API_URL}/shipments/bulk-generate?count=${count}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to generate bulk data");
    return res.json();
  },

  async resetSimulation(): Promise<any> {
    if (MOCK_MODE) {
      MOCK_SHIPMENTS.length = 0;
      return { status: "success", mode: "mock" };
    }
    const res = await fetch(`${API_URL}/shipments/reset-simulation`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to reset simulation");
    return res.json();
  },

  async runScenario(name: string): Promise<any> {
    if (MOCK_MODE) {
      if (name === "storm") {
        MOCK_SHIPMENTS.forEach(s => s.status = "delayed");
      } else if (name === "recovery") {
        MOCK_SHIPMENTS.forEach(s => s.status = "in_transit");
      }
      return { status: "success", mode: "mock", scenario: name };
    }
    const res = await fetch(`${API_URL}/shipments/scenario/${name}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to run scenario");
    return res.json();
  }
};
