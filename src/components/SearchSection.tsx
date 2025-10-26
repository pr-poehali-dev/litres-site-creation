import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface SearchSectionProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedGenre: string;
  setSelectedGenre: (value: string) => void;
  genres: string[];
}

export const SearchSection = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedGenre, 
  setSelectedGenre, 
  genres 
}: SearchSectionProps) => {
  return (
    <div className="mb-8 space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            placeholder="Поиск книг, авторов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <Button size="lg" className="h-12 px-8">
          <Icon name="Search" size={20} className="mr-2" />
          Найти
        </Button>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {genres.map((genre) => (
            <Badge
              key={genre}
              variant={selectedGenre === genre ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </Badge>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
