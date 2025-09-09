-- Insert sample menu items (run this after creating the menu_items table)
INSERT INTO menu_items (name, description, price, category, image_url, is_available) VALUES
('Margherita Pizza', 'Fresh tomatoes, mozzarella cheese, basil, and olive oil', 12.99, 'Pizza', '/placeholder.svg?height=200&width=200', true),
('Pepperoni Pizza', 'Pepperoni, mozzarella cheese, and tomato sauce', 14.99, 'Pizza', '/placeholder.svg?height=200&width=200', true),
('Hawaiian Pizza', 'Ham, pineapple, mozzarella cheese, and tomato sauce', 15.99, 'Pizza', '/placeholder.svg?height=200&width=200', true),
('Meat Lovers Pizza', 'Pepperoni, sausage, ham, bacon, and mozzarella cheese', 18.99, 'Pizza', '/placeholder.svg?height=200&width=200', true),
('Caesar Salad', 'Romaine lettuce, croutons, parmesan cheese, and caesar dressing', 8.99, 'Salads', '/placeholder.svg?height=200&width=200', true),
('Greek Salad', 'Mixed greens, feta cheese, olives, tomatoes, and greek dressing', 9.99, 'Salads', '/placeholder.svg?height=200&width=200', true),
('Grilled Chicken Sandwich', 'Grilled chicken breast, lettuce, tomato, and mayo on a brioche bun', 11.99, 'Sandwiches', '/placeholder.svg?height=200&width=200', true),
('Club Sandwich', 'Turkey, ham, bacon, lettuce, tomato, and mayo on toasted bread', 12.99, 'Sandwiches', '/placeholder.svg?height=200&width=200', true),
('Fish and Chips', 'Beer-battered fish with crispy fries and tartar sauce', 15.99, 'Main Course', '/placeholder.svg?height=200&width=200', true),
('Grilled Salmon', 'Fresh grilled salmon with vegetables and rice', 18.99, 'Main Course', '/placeholder.svg?height=200&width=200', true),
('Beef Steak', 'Grilled beef steak with mashed potatoes and vegetables', 22.99, 'Main Course', '/placeholder.svg?height=200&width=200', true),
('Chicken Alfredo', 'Grilled chicken with fettuccine pasta in creamy alfredo sauce', 16.99, 'Main Course', '/placeholder.svg?height=200&width=200', true),
('Chocolate Cake', 'Rich chocolate cake with chocolate frosting', 6.99, 'Desserts', '/placeholder.svg?height=200&width=200', true),
('Cheesecake', 'New York style cheesecake with berry topping', 7.99, 'Desserts', '/placeholder.svg?height=200&width=200', true),
('Ice Cream Sundae', 'Vanilla ice cream with chocolate sauce and whipped cream', 5.99, 'Desserts', '/placeholder.svg?height=200&width=200', true),
('Coca Cola', 'Classic Coca Cola', 2.99, 'Beverages', '/placeholder.svg?height=200&width=200', true),
('Pepsi', 'Classic Pepsi Cola', 2.99, 'Beverages', '/placeholder.svg?height=200&width=200', true),
('Fresh Orange Juice', 'Freshly squeezed orange juice', 3.99, 'Beverages', '/placeholder.svg?height=200&width=200', true),
('Apple Juice', 'Fresh apple juice', 3.99, 'Beverages', '/placeholder.svg?height=200&width=200', true),
('Coffee', 'Freshly brewed coffee', 2.49, 'Beverages', '/placeholder.svg?height=200&width=200', true)
ON CONFLICT DO NOTHING;
