import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import Globe from "react-globe.gl";
import { 
  VOLUNTEER_LOCATIONS, 
  getConnectionArcs,
  getTotalVolunteers, 
  getCountriesCount 
} from "../../data/volunteerLocations";

const GlobalVolunteerGlobe = ({ stats }) => {
  const globeEl = useRef();
  const containerRef = useRef();
  const [globeSize, setGlobeSize] = useState({ width: 900, height: 600 });
  const [isLoaded, setIsLoaded] = useState(false);

  // Stats
  const totalVolunteers = useMemo(() => getTotalVolunteers(), []);
  const countriesCount = useMemo(() => getCountriesCount(), []);
  
  // Generate arcs from Kerala to all destinations
  const arcsData = useMemo(() => getConnectionArcs(), []);

  // Handle responsive sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = Math.min(900, containerRef.current.offsetWidth);
        const height = Math.min(600, width * 0.67);
        setGlobeSize({ width, height: Math.max(400, height) });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Configure globe on mount
  useEffect(() => {
    if (globeEl.current) {
      // Auto-rotate
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.3;
      globeEl.current.controls().enableZoom = false;
      
      // Set initial view centered on Kerala (hub)
      globeEl.current.pointOfView({ lat: 10.8505, lng: 76.2711, altitude: 1.8 }, 1000);
      
      // Mark as loaded after a short delay
      setTimeout(() => setIsLoaded(true), 500);
    }
  }, []);

  // Point color - simplified for airline routes style
  const getPointColor = useCallback((point) => {
    if (point.isHQ) return "#fbbf24"; // Gold for HQ
    return "#60a5fa"; // Blue for destinations
  }, []);

  // Point altitude - subtle for destinations, prominent for hub
  const getPointAltitude = useCallback((point) => {
    if (point.isHQ) return 0.08;
    return 0.01; // Very subtle for destinations
  }, []);

  // Point radius - smaller to not compete with arcs
  const getPointRadius = useCallback((point) => {
    if (point.isHQ) return 0.6; // Larger hub point
    return 0.12; // Small destination points
  }, []);

  // Custom point label (tooltip on hover)
  const getPointLabel = useCallback((point) => {
    return `
      <div style="
        background: rgba(15, 23, 42, 0.95);
        padding: 10px 14px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.15);
        color: white;
        font-family: system-ui, sans-serif;
        font-size: 13px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        backdrop-filter: blur(10px);
      ">
        <div style="font-weight: 600; margin-bottom: 4px; color: ${getPointColor(point)}; font-size: 14px;">
          ${point.city}, ${point.country}
        </div>
        <div style="color: rgba(255,255,255,0.8);">
          ${point.volunteers.toLocaleString()} Navodayans
          ${point.isHQ ? '<span style="color: #fbbf24; margin-left: 4px;">★ Hub</span>' : ''}
        </div>
      </div>
    `;
  }, [getPointColor]);

  // Arc color function
  const getArcColor = useCallback((arc) => {
    return arc.color || ['rgba(255, 200, 50, 0.7)', 'rgba(255, 100, 180, 0.7)'];
  }, []);

  // Arc stroke width
  const getArcStroke = useCallback((arc) => {
    return arc.strokeWidth || 0.5;
  }, []);

  return (
    <div className="w-full">
      {/* Globe Container */}
      <div 
        ref={containerRef}
        className="relative mx-auto"
        style={{ maxWidth: "900px" }}
      >
        {/* Loading State */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-white/20 border-t-yellow-400 rounded-full animate-spin"></div>
              <span className="text-white/60 text-sm">Loading globe...</span>
            </div>
          </div>
        )}

        {/* Globe */}
        <div 
          className={`transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ cursor: 'grab' }}
        >
          <Globe
            ref={globeEl}
            width={globeSize.width}
            height={globeSize.height}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            atmosphereColor="#6366f1"
            atmosphereAltitude={0.25}
            
            // Points (volunteer locations) - simplified
            pointsData={VOLUNTEER_LOCATIONS}
            pointLat="lat"
            pointLng="lng"
            pointColor={getPointColor}
            pointAltitude={getPointAltitude}
            pointRadius={getPointRadius}
            pointLabel={getPointLabel}
            pointsMerge={false}
            
            // Arcs (airline routes from Kerala to all destinations)
            arcsData={arcsData}
            arcStartLat="startLat"
            arcStartLng="startLng"
            arcEndLat="endLat"
            arcEndLng="endLng"
            arcColor={getArcColor}
            arcStroke={getArcStroke}
            arcDashLength={0.5}
            arcDashGap={0.3}
            arcDashAnimateTime={2000}
            arcAltitude={0.3}
            arcAltitudeAutoScale={0.3}
            
            // Rings (pulsing effect at Kerala hub)
            ringsData={VOLUNTEER_LOCATIONS.filter(d => d.isHQ)}
            ringLat="lat"
            ringLng="lng"
            ringColor={() => "#fbbf24"}
            ringMaxRadius={5}
            ringPropagationSpeed={2.5}
            ringRepeatPeriod={1000}
          />
        </div>
      </div>

      {/* Bottom Stats - Continents/Countries/Navodayans */}
      <div className="flex justify-center gap-6 md:gap-12 mt-8 pt-6 border-t border-white/10">
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">
            6
          </div>
          <div className="text-white/60 text-xs md:text-sm uppercase tracking-wider">Continents</div>
        </div>
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">
            {countriesCount}+
          </div>
          <div className="text-white/60 text-xs md:text-sm uppercase tracking-wider">Countries</div>
        </div>
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">
            {totalVolunteers.toLocaleString()}+
          </div>
          <div className="text-white/60 text-xs md:text-sm uppercase tracking-wider">Navodayans</div>
        </div>
      </div>

      {/* Interaction hint */}
      <div className="text-center mt-4 text-white/40 text-xs flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <span>Drag to rotate • Hover for details</span>
      </div>
    </div>
  );
};

export default GlobalVolunteerGlobe;
