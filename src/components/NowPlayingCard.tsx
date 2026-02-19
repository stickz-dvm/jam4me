import React from "react";
import { Music2, Star, User as UserIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface NowPlayingCardProps {
    data: {
        now_playing: string;
        username: string;
        profile_picture?: string;
        star_level?: number;
    } | null;
    className?: string;
}

export function NowPlayingCard({ data, className }: NowPlayingCardProps) {
    if (!data || !data.now_playing) return null;

    const renderStars = (level: number = 0) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                size={12}
                className={i < level ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
            />
        ));
    };

    return (
        <Card className={`bg-card/90 backdrop-blur-md border-primary/20 shadow-xl overflow-hidden rounded-xl ${className}`}>
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <Avatar className="h-12 w-12 border-2 border-primary/20 bg-muted/30">
                            <AvatarImage src={data.profile_picture} alt={data.username || "Guest"} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                <UserIcon size={20} />
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 border-2 border-background">
                            <Music2 size={10} />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider py-0 px-1.5 h-4 border-primary/30 text-primary animate-pulse">
                                Now Playing
                            </Badge>
                            <div className="flex gap-0.5">
                                {renderStars(data.star_level)}
                            </div>
                        </div>
                        <h3 className="text-base font-bold truncate text-foreground leading-tight">
                            {data.now_playing}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <span className="opacity-70">Requested by</span>
                            <span className="font-semibold text-primary">{data.username || "Anonymous"}</span>
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
