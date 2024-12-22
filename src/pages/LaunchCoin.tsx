import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function LaunchCoin() {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate('/rocket-launch');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link to="/" className="text-primary hover:text-primary/90 inline-flex items-center gap-2 mb-8">
        <ArrowLeft className="h-4 w-4" />
        go back
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-primary block">name</label>
          <Input type="text" placeholder="Enter coin name" />
        </div>

        <div className="space-y-2">
          <label className="text-primary block">ticker</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-muted-foreground">$</span>
            </div>
            <Input className="pl-7" type="text" placeholder="Enter ticker symbol" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-primary block">description</label>
          <Textarea placeholder="Enter coin description" />
        </div>

        <div className="space-y-2">
          <label className="text-primary block">image or video</label>
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">drag and drop an image or video</p>
            <Button variant="outline" size="sm">
              select file
            </Button>
          </div>
        </div>

        <div>
          <Button variant="link" className="text-primary p-0">
            show more options ↓
          </Button>
        </div>

        <Button type="submit" className="w-full">
          create coin
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          when your coin completes its bonding curve you receive 0.5 SOL
        </p>
      </form>
    </div>
  );
}
