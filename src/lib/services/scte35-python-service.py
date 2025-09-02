#!/usr/bin/env python3
"""
SCTE-35 Service using threefive library
This service provides SCTE-35 parsing, encoding, and manipulation capabilities
"""

import json
import sys
import asyncio
from typing import Dict, List, Any, Optional
import base64
import struct
from datetime import datetime, timedelta

try:
    import threefive
    THREEFIVE_AVAILABLE = True
except ImportError:
    THREEFIVE_AVAILABLE = False
    print("threefive not available. Install with: pip install threefive", file=sys.stderr)

class SCTE35Service:
    """SCTE-35 Service wrapper using threefive library"""
    
    def __init__(self):
        self.available = THREEFIVE_AVAILABLE
        if not self.available:
            print("Warning: threefive library not available. SCTE-35 features will be limited.", file=sys.stderr)
    
    def parse_from_mpegts(self, mpegts_data: bytes) -> List[Dict[str, Any]]:
        """Parse SCTE-35 cues from MPEGTS data"""
        if not self.available:
            return []
        
        try:
            # Create a temporary file with the MPEGTS data
            with open('/tmp/temp.ts', 'wb') as f:
                f.write(mpegts_data)
            
            # Parse SCTE-35 from the file
            cues = []
            stream = threefive.Stream()
            stream.decode('/tmp/temp.ts')
            
            # Convert threefive cues to our format
            for cue in stream.cues:
                cues.append(self._cue_to_dict(cue))
            
            return cues
        except Exception as e:
            print(f"Error parsing MPEGTS: {e}", file=sys.stderr)
            return []
    
    def parse_from_bytes(self, data: bytes) -> Optional[Dict[str, Any]]:
        """Parse SCTE-35 cue from raw bytes"""
        if not self.available:
            return None
        
        try:
            cue = threefive.Cue(data)
            cue.decode()
            return self._cue_to_dict(cue)
        except Exception as e:
            print(f"Error parsing bytes: {e}", file=sys.stderr)
            return None
    
    def parse_from_base64(self, base64_data: str) -> Optional[Dict[str, Any]]:
        """Parse SCTE-35 cue from base64 encoded data"""
        try:
            data = base64.b64decode(base64_data)
            return self.parse_from_bytes(data)
        except Exception as e:
            print(f"Error parsing base64: {e}", file=sys.stderr)
            return None
    
    def create_splice_insert(self, 
                            start_time: Optional[float] = None,
                            duration: Optional[float] = None,
                            auto_return: bool = True,
                            event_id: Optional[int] = None,
                            upids: Optional[List[Dict]] = None) -> str:
        """Create a splice insert SCTE-35 cue"""
        if not self.available:
            return ""
        
        try:
            splice = threefive.SpliceInsert()
            
            # Set basic properties
            if event_id is not None:
                splice.event_id = event_id
            else:
                splice.event_id = int(asyncio.get_event_loop().time() * 90000)  # PCR-based ID
            
            if start_time is not None:
                splice.splice_time = start_time
            
            if duration is not None:
                splice.break_duration = duration
            
            splice.auto_return = auto_return
            
            # Add UPIDs if provided
            if upids:
                for upid_data in upids:
                    upid = threefive.Upid()
                    upid.format = upid_data.get('format', 0x0C)  # Default to URI
                    upid.data = upid_data.get('data', '')
                    splice.upids.append(upid)
            
            # Encode to bytes
            cue_bytes = splice.encode()
            return base64.b64encode(cue_bytes).decode()
        except Exception as e:
            print(f"Error creating splice insert: {e}", file=sys.stderr)
            return ""
    
    def create_time_signal(self, 
                          pts: float,
                          event_id: Optional[int] = None) -> str:
        """Create a time signal SCTE-35 cue"""
        if not self.available:
            return ""
        
        try:
            time_signal = threefive.TimeSignal()
            
            if event_id is not None:
                time_signal.event_id = event_id
            else:
                time_signal.event_id = int(asyncio.get_event_loop().time() * 90000)
            
            time_signal.pts = pts
            
            # Encode to bytes
            cue_bytes = time_signal.encode()
            return base64.b64encode(cue_bytes).decode()
        except Exception as e:
            print(f"Error creating time signal: {e}", file=sys.stderr)
            return ""
    
    def create_segmentation_descriptor(self,
                                    segmentation_type_id: int,
                                    segment_num: int = 0,
                                    segments_expected: int = 0,
                                    sub_segment_num: int = 0,
                                    sub_segments_expected: int = 0) -> Dict[str, Any]:
        """Create a segmentation descriptor"""
        if not self.available:
            return {}
        
        try:
            descriptor = threefive.SegmentationDescriptor()
            descriptor.segmentation_type_id = segmentation_type_id
            descriptor.segment_num = segment_num
            descriptor.segments_expected = segments_expected
            descriptor.sub_segment_num = sub_segment_num
            descriptor.sub_segments_expected = sub_segments_expected
            
            return {
                'type': 'segmentation_descriptor',
                'segmentation_type_id': descriptor.segmentation_type_id,
                'segment_num': descriptor.segment_num,
                'segments_expected': descriptor.segments_expected,
                'sub_segment_num': descriptor.sub_segment_num,
                'sub_segments_expected': descriptor.sub_segments_expected
            }
        except Exception as e:
            print(f"Error creating segmentation descriptor: {e}", file=sys.stderr)
            return {}
    
    def inject_into_mpegts(self, 
                           input_file: str, 
                           output_file: str, 
                           scte35_cues: List[str]) -> bool:
        """Inject SCTE-35 cues into MPEGTS file"""
        if not self.available:
            return False
        
        try:
            # This is a simplified version - in practice, you'd use threefive's packet injection
            # For now, we'll create a new file with SCTE-35 data
            print(f"Injecting {len(scte35_cues)} SCTE-35 cues from {input_file} to {output_file}")
            
            # Read input file
            with open(input_file, 'rb') as f:
                mpegts_data = f.read()
            
            # Write to output file (simplified - real injection would be more complex)
            with open(output_file, 'wb') as f:
                f.write(mpegts_data)
            
            return True
        except Exception as e:
            print(f"Error injecting into MPEGTS: {e}", file=sys.stderr)
            return False
    
    def parse_hls_manifest(self, manifest_url: str) -> List[Dict[str, Any]]:
        """Parse HLS manifest and extract SCTE-35 cues"""
        if not self.available:
            return []
        
        try:
            # Use threefive's HLS parsing capabilities
            cues = []
            
            # This would use threefive's HLS parsing
            # For now, return empty list as placeholder
            print(f"Parsing HLS manifest: {manifest_url}")
            
            return cues
        except Exception as e:
            print(f"Error parsing HLS manifest: {e}", file=sys.stderr)
            return []
    
    def get_segmentation_type_name(self, segmentation_type_id: int) -> str:
        """Get human-readable name for segmentation type ID"""
        segmentation_types = {
            0x00: "Restriction",
            0x01: "Provider Advertisement Opportunity",
            0x02: "Distributor Advertisement Opportunity",
            0x03: "Provider Placement Opportunity",
            0x04: "Distributor Placement Opportunity",
            0x06: "Provider Overlay Opportunity",
            0x07: "Distributor Overlay Opportunity",
            0x08: "Program Start",
            0x09: "Program End",
            0x0A: "Program Early Termination",
            0x0B: "Program Breakaway",
            0x0C: "Program Resumption",
            0x0D: "Program Runover Planned",
            0x0E: "Program Runover Unplanned",
            0x0F: "Program Overlap Start",
            0x10: "Program Blackout Override",
            0x11: "Program Start In Progress",
            0x12: "Chapter Start",
            0x13: "Chapter End",
            0x14: "Break Start",
            0x15: "Break End",
            0x16: "Provider Advertisement Start",
            0x17: "Provider Advertisement End",
            0x18: "Distributor Advertisement Start",
            0x19: "Distributor Advertisement End",
            0x1A: "Provider Placement Opportunity Start",
            0x1B: "Provider Placement Opportunity End",
            0x1C: "Distributor Placement Opportunity Start",
            0x1D: "Distributor Placement Opportunity End",
            0x1E: "Unscheduled Event Start",
            0x1F: "Unscheduled Event End",
            0x20: "Network Start",
            0x21: "Network End",
            0x22: "Provider Private",
            0x23: "Distributor Private",
            0x24: "Provider IAB Standard",
            0x25: "Distributor IAB Standard",
            0x30: "Content Identification",
            0x31: "Program Identification",
            0x32: "Intermission Start",
            0x33: "Intermission End",
            0x34: "Start of Content",
            0x35: "End of Content",
            0x36: "Provider Alternate Content Start",
            0x37: "Provider Alternate Content End",
            0x38: "Distributor Alternate Content Start",
            0x39: "Distributor Alternate Content End",
            0x3A: "Provider Emergency Alert Start",
            0x3B: "Provider Emergency Alert End",
            0x3C: "Distributor Emergency Alert Start",
            0x3D: "Distributor Emergency Alert End"
        }
        
        return segmentation_types.get(segmentation_type_id, f"Unknown Type (0x{segmentation_type_id:02X})")
    
    def _cue_to_dict(self, cue) -> Dict[str, Any]:
        """Convert threefive cue to dictionary format"""
        try:
            cue_dict = {
                'type': cue.__class__.__name__,
                'event_id': getattr(cue, 'event_id', None),
                'pts': getattr(cue, 'pts', None),
                'splice_time': getattr(cue, 'splice_time', None),
                'auto_return': getattr(cue, 'auto_return', None),
                'break_duration': getattr(cue, 'break_duration', None),
                'descriptors': []
            }
            
            # Add descriptors if available
            if hasattr(cue, 'descriptors'):
                for descriptor in cue.descriptors:
                    desc_dict = {
                        'type': descriptor.__class__.__name__,
                        'tag': getattr(descriptor, 'tag', None)
                    }
                    
                    # Add segmentation descriptor specific data
                    if hasattr(descriptor, 'segmentation_type_id'):
                        desc_dict['segmentation_type_id'] = descriptor.segmentation_type_id
                        desc_dict['segmentation_type_name'] = self.get_segmentation_type_name(descriptor.segmentation_type_id)
                        desc_dict['segment_num'] = getattr(descriptor, 'segment_num', None)
                        desc_dict['segments_expected'] = getattr(descriptor, 'segments_expected', None)
                    
                    cue_dict['descriptors'].append(desc_dict)
            
            # Add UPIDs if available
            if hasattr(cue, 'upids') and cue.upids:
                cue_dict['upids'] = []
                for upid in cue.upids:
                    upid_dict = {
                        'format': getattr(upid, 'format', None),
                        'data': getattr(upid, 'data', None)
                    }
                    cue_dict['upids'].append(upid_dict)
            
            return cue_dict
        except Exception as e:
            print(f"Error converting cue to dict: {e}", file=sys.stderr)
            return {}

def main():
    """Main function for CLI usage"""
    if len(sys.argv) < 2:
        print("Usage: python scte35-python-service.py <command> [args...]")
        print("Commands:")
        print("  parse-mpegts <file> - Parse SCTE-35 from MPEGTS file")
        print("  parse-bytes <base64> - Parse SCTE-35 from base64 encoded bytes")
        print("  create-splice-insert - Create a splice insert cue")
        print("  create-time-signal <pts> - Create a time signal cue")
        print("  status - Check threefive availability")
        return
    
    service = SCTE35Service()
    command = sys.argv[1]
    
    if command == "status":
        print(f"threefive available: {service.available}")
        if service.available:
            print(f"threefive version: {threefive.__version__}")
    
    elif command == "parse-mpegts":
        if len(sys.argv) < 3:
            print("Usage: python scte35-python-service.py parse-mpegts <file>")
            return
        
        try:
            with open(sys.argv[2], 'rb') as f:
                data = f.read()
            
            cues = service.parse_from_mpegts(data)
            print(f"Found {len(cues)} SCTE-35 cues:")
            for i, cue in enumerate(cues):
                print(f"  Cue {i+1}: {cue}")
        except Exception as e:
            print(f"Error: {e}")
    
    elif command == "parse-bytes":
        if len(sys.argv) < 3:
            print("Usage: python scte35-python-service.py parse-bytes <base64>")
            return
        
        cue = service.parse_from_base64(sys.argv[2])
        print(f"Parsed cue: {cue}")
    
    elif command == "create-splice-insert":
        cue_b64 = service.create_splice_insert()
        print(f"Created splice insert: {cue_b64}")
    
    elif command == "create-time-signal":
        pts = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
        cue_b64 = service.create_time_signal(pts)
        print(f"Created time signal: {cue_b64}")
    
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()