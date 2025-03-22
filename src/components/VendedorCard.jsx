import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";


import { baixarJsonVendedor } from "../services/api";

const VendedorCard = ({ vendedor }) => {
  const { vendedor: nome, email, url } = vendedor;

  const handleDownload = () => {
    window.open(baixarJsonVendedor(url), "_blank");
  };

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition">
      <CardContent className="p-5 space-y-2">
        <div className="text-lg font-semibold">{nome}</div>
        <div className="text-sm text-muted-foreground">{email}</div>
        <Button onClick={handleDownload} className="mt-3">
          📥 Baixar JSON
        </Button>
      </CardContent>
    </Card>
  );
};

export default VendedorCard;
