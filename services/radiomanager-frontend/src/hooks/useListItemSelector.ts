import { RefObject, useCallback, useEffect, useState } from 'react'
import { useHotkey } from '@/hooks/useHotkey'

interface ListItem<I> {
  item: I
  isSelected: boolean
}

const makeListItem = <I>(item: I) => ({ item, isSelected: false })

const mapToListItems = <T>(items: readonly T[]) => {
  return items.map(makeListItem)
}

export const useListItemSelector = <I>(initialItems: readonly I[]) => {
  const [listItems, setListItems] = useState<readonly ListItem<I>[]>(mapToListItems(initialItems))
  const [cursor, setCursor] = useState<null | number>(null)

  // Reset selection on tracks list update.
  useEffect(() => {
    setListItems((prevItems) => {
      const prevItemsMap = new Map(prevItems.map((item) => [item.item, item]))

      return initialItems.map((item) => {
        const prevItem = prevItemsMap.get(item)
        return prevItem ? { ...prevItem, item } : makeListItem(item)
      })
    })
  }, [initialItems])

  const select = (selectIndex: number) => {
    setCursor(selectIndex)
    setListItems((items) =>
      items.map((item, index) => {
        return selectIndex === index ? { ...item, isSelected: true } : item
      }),
    )
  }

  const toggle = (selectIndex: number) => {
    setCursor(selectIndex)
    setListItems((items) =>
      items.map((item, index) => {
        return selectIndex === index ? { ...item, isSelected: !item.isSelected } : item
      }),
    )
  }

  const selectOnly = (selectIndex: number) => {
    setCursor(selectIndex)
    setListItems((items) =>
      items.map((item, index) => {
        return { ...item, isSelected: selectIndex === index }
      }),
    )
  }

  const discard = (discardIndex: number) => {
    setCursor(discardIndex)
    setListItems((items) =>
      items.map((item, index) => {
        return discardIndex === index ? { ...item, isSelected: false } : item
      }),
    )
  }

  const selectTo = (endIndex: number) => {
    const startIndex = cursor ?? 0

    setListItems((items) => {
      return items.map((item, index) => {
        return endIndex > startIndex
          ? {
              ...item,
              isSelected: startIndex <= index && index <= endIndex,
            }
          : {
              ...item,
              isSelected: endIndex <= index && index <= startIndex,
            }
      })
    })
  }

  const reset = () => {
    setCursor(null)
    setListItems((items) => items.map(({ item }) => makeListItem(item)))
  }

  return { listItems, select, selectOnly, discard, selectTo, reset, toggle }
}
