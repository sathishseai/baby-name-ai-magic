
import Header from "@/components/navigation/Header";
import BabyNameForm from "@/components/forms/BabyNameForm";

const NameGenerator = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-24 pb-12">
        <BabyNameForm />
      </div>
    </div>
  );
};

export default NameGenerator;
