import { formatDistanceToNow, parseISO } from 'date-fns';

const getHomeReadableDate = (date: string) => {
    return formatDistanceToNow(parseISO(date))
}

export { getHomeReadableDate }
