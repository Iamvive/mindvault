import SwiftUI
import AppKit

struct RotaryKnobView: View {
    let title: String
    let valueText: String
    let angle: Double // -120 to +120 degrees
    let activeColor: Color
    let onTap: () -> Void
    let onScroll: (CGFloat) -> Void

    var body: some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.system(size: 9, weight: .bold))
                .foregroundColor(.secondary)

            ZStack {
                // Outer Dial Ring
                Circle()
                    .stroke(Color.secondary.opacity(0.2), lineWidth: 3)
                    .frame(width: 38, height: 38)

                // Active Arc Indicator
                Circle()
                    .trim(from: 0.0, to: 0.75)
                    .stroke(activeColor, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                    .frame(width: 38, height: 38)
                    .rotationEffect(.degrees(135 + angle))

                // Inner Knob Center with Needle Pointer
                ZStack {
                    Circle()
                        .fill(Color(NSColor.controlBackgroundColor))
                        .shadow(color: Color.black.opacity(0.15), radius: 2, x: 0, y: 1)

                    // Needle Indicator Point
                    Capsule()
                        .fill(activeColor)
                        .frame(width: 2.5, height: 10)
                        .offset(y: -8)
                        .rotationEffect(.degrees(angle))
                }
                .frame(width: 28, height: 28)
            }
            .contentShape(Rectangle())
            .onTapGesture {
                onTap()
            }

            Text(valueText)
                .font(.system(size: 9, weight: .semibold))
                .foregroundColor(activeColor)
                .lineLimit(1)
        }
    }
}
