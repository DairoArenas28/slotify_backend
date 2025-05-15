import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const addMinutes = (timeString: string, minutesToAdd: number): string => {
  const time = dayjs(timeString, 'hh:mm A'); // Convierte "01:30 PM" en Date
  const newTime = time.add(minutesToAdd, 'minute'); // Suma minutos
  return newTime.format('hh:mm A'); // Retorna como string formateado
};