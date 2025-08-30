
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, IndianRupee } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Payment {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  credits_to_add: number;
  status: string;
  payment_method: string | null;
  created_at: string;
}

const PaymentHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPaymentHistory();
    }
  }, [user]);

  const fetchPaymentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching payment history:", error);
        return;
      }

      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default" className="bg-green-500">Paid</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "created":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading payment history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment History
        </CardTitle>
        <CardDescription>
          Your recent credit purchases and transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {payments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No payment history found. Purchase credits to see transactions here.
          </p>
        ) : (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  <span className="font-medium">
                    ₹{payment.amount / 100} for {payment.credits_to_add} credits
                  </span>
                  {getStatusBadge(payment.status)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(payment.created_at), "MMM dd, yyyy 'at' HH:mm")}
                </div>
                {payment.payment_method && (
                  <p className="text-xs text-muted-foreground">
                    Payment method: {payment.payment_method}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
