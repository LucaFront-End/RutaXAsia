import { useEffect, useRef } from 'react'

/**
 * FallingElements — Interactive seasonal particle effects.
 * Rendered as an overlay on Hero components.
 * @param {string} type - 'sakura' | 'verano' | 'momiji'
 */
export default function FallingElements({ type }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        // Respect accessibility settings
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return
        }

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        let animationFrameId
        let particles = []
        let width = (canvas.width = canvas.offsetWidth)
        let height = (canvas.height = canvas.offsetHeight)

        const handleResize = () => {
            if (!canvas) return
            width = canvas.width = canvas.offsetWidth
            height = canvas.height = canvas.offsetHeight
        }
        window.addEventListener('resize', handleResize)

        // Particle configuration based on season
        const maxParticles = type === 'verano' ? 40 : 60
        
        class Particle {
            constructor(isInitial = false) {
                this.reset(isInitial)
            }

            reset(isInitial = false) {
                this.x = Math.random() * width
                // Distribute vertically initially, otherwise spawn from top/left/right boundary
                this.y = isInitial ? Math.random() * height : -20
                this.size = Math.random() * 8 + 4
                
                if (type === 'sakura') {
                    // Sakura petals fall down and drift right due to wind
                    this.speedX = Math.random() * 1.5 + 0.5
                    this.speedY = Math.random() * 1.2 + 0.8
                    this.angle = Math.random() * Math.PI * 2
                    this.spin = Math.random() * 0.02 - 0.01
                    this.opacity = Math.random() * 0.5 + 0.4
                    this.swingSpeed = Math.random() * 0.02 + 0.01
                    this.swingRange = Math.random() * 15 + 5
                    this.swingAngle = Math.random() * Math.PI * 2
                } else if (type === 'momiji') {
                    // Momiji leaves fall slightly faster and swing wider
                    this.speedX = Math.random() * 1.2 - 0.2
                    this.speedY = Math.random() * 1.4 + 1.0
                    this.angle = Math.random() * Math.PI * 2
                    this.spin = Math.random() * 0.03 - 0.015
                    this.opacity = Math.random() * 0.6 + 0.3
                    this.swingSpeed = Math.random() * 0.015 + 0.005
                    this.swingRange = Math.random() * 25 + 10
                    this.swingAngle = Math.random() * Math.PI * 2
                    
                    // Colors of autumn leaves (deep red, orange, golden orange)
                    const colors = [
                        '196, 73, 0',   // Orange
                        '216, 67, 21',  // Orange Red
                        '230, 81, 0',   // Deep Orange
                        '183, 28, 28',  // Crimson Red
                    ]
                    this.color = colors[Math.floor(Math.random() * colors.length)]
                } else if (type === 'verano') {
                    // Summer fireflies drift upwards/around gently
                    this.speedX = Math.random() * 0.8 - 0.4
                    this.speedY = -(Math.random() * 0.5 + 0.2)
                    this.size = Math.random() * 5 + 3
                    this.opacity = Math.random() * 0.5 + 0.1
                    this.fadeSpeed = Math.random() * 0.008 + 0.003
                    this.fadeDirection = Math.random() > 0.5 ? 1 : -1
                    // Set spawn boundary for upward motion
                    if (!isInitial) {
                        this.y = height + 20
                    }
                }
            }

            update() {
                if (type === 'sakura') {
                    this.y += this.speedY
                    this.swingAngle += this.swingSpeed
                    this.x += this.speedX + Math.sin(this.swingAngle) * 0.3
                    this.angle += this.spin
                    
                    // Recycle particles
                    if (this.y > height + 20 || this.x > width + 20) {
                        this.reset()
                    }
                } else if (type === 'momiji') {
                    this.y += this.speedY
                    this.swingAngle += this.swingSpeed
                    this.x += this.speedX + Math.sin(this.swingAngle) * 0.5
                    this.angle += this.spin
                    
                    if (this.y > height + 20 || this.x > width + 20 || this.x < -20) {
                        this.reset()
                    }
                } else if (type === 'verano') {
                    this.y += this.speedY
                    this.x += this.speedX + Math.sin(this.y * 0.01) * 0.2
                    
                    // Fireflies glow intensity breathes
                    this.opacity += this.fadeSpeed * this.fadeDirection
                    if (this.opacity >= 0.8) {
                        this.fadeDirection = -1
                    } else if (this.opacity <= 0.05) {
                        this.fadeDirection = 1
                    }

                    if (this.y < -20 || this.x > width + 20 || this.x < -20) {
                        this.reset()
                    }
                }
            }

            draw() {
                if (type === 'sakura') {
                    ctx.save()
                    ctx.translate(this.x, this.y)
                    ctx.rotate(this.angle)
                    ctx.beginPath()
                    // Draw a detailed sakura cherry petal shape
                    ctx.moveTo(0, 0)
                    ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size)
                    ctx.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0)
                    ctx.fillStyle = `rgba(248, 180, 200, ${this.opacity})`
                    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)'
                    ctx.shadowBlur = 4
                    ctx.fill()
                    ctx.restore()
                } else if (type === 'momiji') {
                    ctx.save()
                    ctx.translate(this.x, this.y)
                    ctx.rotate(this.angle)
                    ctx.beginPath()
                    // Draw a simplified multi-pointed maple leaf
                    ctx.moveTo(0, -this.size)
                    ctx.lineTo(this.size * 0.25, -this.size * 0.25)
                    ctx.lineTo(this.size * 0.9, -this.size * 0.35)
                    ctx.lineTo(this.size * 0.45, 0)
                    ctx.lineTo(this.size * 0.7, this.size * 0.5)
                    ctx.lineTo(this.size * 0.15, this.size * 0.2)
                    ctx.lineTo(0, this.size)
                    ctx.lineTo(-this.size * 0.15, this.size * 0.2)
                    ctx.lineTo(-this.size * 0.7, this.size * 0.5)
                    ctx.lineTo(-this.size * 0.45, 0)
                    ctx.lineTo(-this.size * 0.9, -this.size * 0.35)
                    ctx.lineTo(-this.size * 0.25, -this.size * 0.25)
                    ctx.closePath()
                    ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
                    ctx.shadowBlur = 5
                    ctx.fill()
                    ctx.restore()
                } else if (type === 'verano') {
                    ctx.save()
                    ctx.beginPath()
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                    // Firefly glowing gradient
                    const grad = ctx.createRadialGradient(
                        this.x, this.y, 0,
                        this.x, this.y, this.size
                    )
                    grad.addColorStop(0, `rgba(255, 241, 118, ${this.opacity})`)
                    grad.addColorStop(0.3, `rgba(255, 235, 59, ${this.opacity * 0.6})`)
                    grad.addColorStop(1, 'rgba(255, 235, 59, 0)')
                    
                    ctx.fillStyle = grad
                    ctx.fill()
                    ctx.restore()
                }
            }
        }

        // Initialize particles
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle(true))
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, width, height)
            particles.forEach((p) => {
                p.update()
                p.draw()
            })
            animationFrameId = requestAnimationFrame(animate)
        }
        
        animate()

        return () => {
            window.removeEventListener('resize', handleResize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [type])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 2,
            }}
        />
    )
}
