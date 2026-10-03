"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Map as LeafletMap, Marker } from "leaflet";
import type { DoctorMapOverview } from "@/repositories/doctor-repository";
import "leaflet/dist/leaflet.css";

export function DoctorMap({ overview, selectedProvinceId }: { overview: DoctorMapOverview; selectedProvinceId?: number }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const provinceMarkers = useRef<Map<number, Marker>>(new Map());
  const router = useRouter();
  const [unavailable, setUnavailable] = useState(false);
  const [ready, setReady] = useState(false);
  // Serialized aggregate data remains stable when navigating between provinces/pages.
  const overviewJSON = JSON.stringify(overview);
  useEffect(() => {
    let disposed = false;
    let resize: ResizeObserver | undefined;
    void import("leaflet").then((L) => {
      if (disposed || !container.current) return;
      const data: DoctorMapOverview = JSON.parse(overviewJSON);
      const instance = L.map(container.current, { scrollWheelZoom: false, minZoom: 4, maxZoom: 12 });
      map.current = instance;
      instance.fitBounds([[5.6, 97.3], [20.5, 105.8]], { padding: [20, 20] });
      const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(instance);
      tiles.on("tileerror", () => { if (!disposed) setUnavailable(true); });
      const countryLayer = L.layerGroup();
      const provincesLayer = L.layerGroup();
      const markerContent = (label: string, count: number, country = false) => {
        const element = document.createElement("div");
        element.className = country ? "doctor-map-country" : "doctor-map-count";
        const number = document.createElement("strong"); number.textContent = count.toLocaleString("th-TH"); element.append(number);
        if (country) { const name = document.createElement("span"); name.textContent = label; element.append(name); }
        return element;
      };
      L.marker([14, 101], { icon: L.divIcon({ html: markerContent("จักษุแพทย์ทั่วประเทศ", data.total, true), className: "doctor-map-marker", iconSize: [156, 76], iconAnchor: [78, 38] }), title: "ดูจำนวนจักษุแพทย์รายจังหวัด", keyboard: true })
        .on("click", () => instance.setView([14, 101], 7)).addTo(countryLayer);
      for (const province of data.provinces) {
        if (!province.center) continue;
        const label = `${province.name}: ${province.count.toLocaleString("th-TH")} คน`;
        const marker = L.marker(province.center, { icon: L.divIcon({ html: markerContent(province.name, province.count), className: `doctor-map-marker${province.count === 0 ? " doctor-map-empty" : ""}`, iconSize: [40, 40], iconAnchor: [20, 20] }), title: label, alt: label, keyboard: true });
        const tooltip = document.createElement("span"); tooltip.textContent = label;
        marker.bindTooltip(tooltip, { direction: "top" });
        marker.on("click", () => router.push(`/doctors/map?province=${province.id}#province-results`, { scroll: false }));
        marker.addTo(provincesLayer); provinceMarkers.current.set(province.id, marker);
      }
      const updateLayers = () => {
        if (instance.getZoom() < 7) { instance.removeLayer(provincesLayer); countryLayer.addTo(instance); }
        else { instance.removeLayer(countryLayer); provincesLayer.addTo(instance); }
      };
      instance.on("zoomend", updateLayers); updateLayers();
      resize = new ResizeObserver(() => instance.invalidateSize()); resize.observe(container.current);
      setReady(true);
    }).catch(() => { if (!disposed) setUnavailable(true); });
    const markers = provinceMarkers.current;
    return () => { disposed = true; resize?.disconnect(); map.current?.remove(); map.current = null; markers.clear(); };
  }, [overviewJSON, router]);

  useEffect(() => {
    if (!ready || !map.current || !selectedProvinceId) return;
    const marker = provinceMarkers.current.get(selectedProvinceId);
    if (marker) {
      map.current.setView(marker.getLatLng(), 9);
      marker.openTooltip();
    }
  }, [selectedProvinceId, ready]);

  return <div>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-[var(--muted)]">กดจำนวนรวม หรือซูมเข้าเพื่อเลือกจังหวัด</p><button type="button" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-bold text-[var(--primary-dark)]" onClick={() => { map.current?.fitBounds([[5.6, 97.3], [20.5, 105.8]], { padding: [20, 20] }); }}>ดูทั้งประเทศ</button></div>
    {unavailable && <p role="status" className="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">โหลดแผนที่พื้นหลังไม่สำเร็จ คุณยังเลือกจังหวัดจากรายการด้านล่างได้</p>}
    <div ref={container} className="doctor-map relative z-0 h-[450px] rounded-2xl border border-[var(--border)] bg-[var(--secondary)] sm:h-[560px]" role="region" aria-label="แผนที่จำนวนจักษุแพทย์รายจังหวัด" />
    <p className="mt-3 text-xs leading-5 text-[var(--muted)]">จุดบนแผนที่แทนจังหวัด ไม่ใช่ตำแหน่งสถานพยาบาล · พิกัดจาก <a href="https://github.com/open-admin-data/thailand-administrative-divisions" className="underline">Open Admin Data</a> (jakkrapongt, <a href="https://creativecommons.org/licenses/by/4.0/" className="underline">CC BY 4.0</a>; ปรับเป็นชื่อและพิกัดจังหวัด)</p>
  </div>;
}
