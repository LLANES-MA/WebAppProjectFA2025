import { Card } from './ui/card';

const categories = [
  { name: 'Pizza', emoji: '🍕', color: 'from-red-500/20 to-orange-500/20' },
  { name: 'Burgers', emoji: '🍔', color: 'from-yellow-500/20 to-red-500/20' },
  { name: 'Sushi', emoji: '🍣', color: 'from-green-500/20 to-teal-500/20' },
  { name: 'Pasta', emoji: '🍝', color: 'from-amber-500/20 to-orange-500/20' },
  { name: 'Chinese', emoji: '🥡', color: 'from-red-500/20 to-pink-500/20' },
  { name: 'Mexican', emoji: '🌮', color: 'from-lime-500/20 to-green-500/20' },
  { name: 'Indian', emoji: '🍛', color: 'from-orange-500/20 to-red-500/20' },
  { name: 'Thai', emoji: '🍜', color: 'from-purple-500/20 to-pink-500/20' },
];

export default function FoodCategories() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            What are you craving?
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose from our wide variety of cuisines
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category, index) => (
            <Card
              key={index}
              className="group cursor-pointer transition-all duration-300 hover:scale-105 bg-card/60 backdrop-blur-sm border-white/10 hover:border-primary/30"
            >
              <div className={`p-6 text-center bg-gradient-to-br ${category.color} rounded-lg`}>
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.emoji}
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}