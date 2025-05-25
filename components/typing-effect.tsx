"use client"

import { useEffect, useState } from "react"

interface TypingEffectProps {
  phrases: string[]
  typingSpeed?: number
  deletingSpeed?: number
  delayAfterPhrase?: number
  className?: string
}

export function TypingEffect({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayAfterPhrase = 1500,
  className,
}: TypingEffectProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isWaiting) {
      timeout = setTimeout(() => {
        setIsWaiting(false)
        setIsDeleting(true)
      }, delayAfterPhrase)
      return () => clearTimeout(timeout)
    }

    const currentPhrase = phrases[currentPhraseIndex]

    if (isDeleting) {
      if (currentText === "") {
        setIsDeleting(false)
        setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length)
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1))
        }, deletingSpeed)
      }
    } else {
      if (currentText === currentPhrase) {
        setIsWaiting(true)
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1))
        }, typingSpeed)
      }
    }

    return () => clearTimeout(timeout)
  }, [currentText, currentPhraseIndex, isDeleting, isWaiting, phrases, typingSpeed, deletingSpeed, delayAfterPhrase])

  return (
    <div className={className}>
      <span>{currentText}</span>
      <span className="animate-pulse">|</span>
    </div>
  )
}
